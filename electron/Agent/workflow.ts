import { type MemorySaver, Command } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { nodes } from "../../src/shared/types/globaltype";
import { Servicefetch } from "../../src/features/services/types/type";
import { createNodeDeepAgent, buildSubAgentSpec } from "./node-deepagent";
import crypto from "crypto";

export interface NodeUsage {
  nodeName: string;
  agent: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

const NODE_INACTIVITY_TIMEOUT_MS = 90_000;

// Wraps a stream so a model/provider that stops producing any events at all
// (hangs, silently dropped connection, etc.) fails loudly after a timeout
// instead of leaving the workflow looking like it's still "Working"
// forever with no error and no reply.
async function* withInactivityTimeout(
  stream: AsyncIterable<any>,
  timeoutMs: number,
  nodeName: string,
): AsyncGenerator<any> {
  const iterator = stream[Symbol.asyncIterator]();
  while (true) {
    let timer: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new Error(
              `"${nodeName}" stopped responding for ${Math.round(timeoutMs / 1000)}s — the model or provider may be hung.`,
            ),
          ),
        timeoutMs,
      );
    });
    try {
      const result = await Promise.race([iterator.next(), timeoutPromise]);
      if (result.done) return;
      yield result.value;
    } finally {
      clearTimeout(timer!);
    }
  }
}

// The chainDepth-based attribution in consumeStream classifies live stream
// chunks by nesting depth heuristics, which can misattribute a node's
// post-delegation reply (e.g. an Orchestrator's summary after its sub-agent's
// "task" tool call returns) so it never lands on that node's canvas output —
// even though the model demonstrably produced real text (non-zero output
// tokens). This reads the actual final AI message straight out of the
// agent's resolved state as an authoritative fallback, independent of
// whichever stream chunks got attributed where.
function extractFinalText(finalState: any): string {
  const messages = finalState?.values?.messages;
  if (!messages?.length) return "";

  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i] as any;
    if (!AIMessage.isInstance(m)) continue;
    const content = m.content;
    if (typeof content === "string") {
      if (content.trim()) return content;
    } else if (Array.isArray(content)) {
      const text = content
        .filter((c: any) => c?.type === "text" && c.text)
        .map((c: any) => c.text)
        .join("");
      if (text.trim()) return text;
    }
  }
  return "";
}

function extractTokenUsage(finalState: any): { inputTokens: number; outputTokens: number } {
  const messages = finalState?.values?.messages;
  if (!messages?.length) return { inputTokens: 0, outputTokens: 0 };

  let inputTokens = 0;
  let outputTokens = 0;

  for (const msg of messages) {
    const m = msg as any;
    const meta = m?.usage_metadata;
    if (meta) {
      inputTokens += meta.input_tokens ?? 0;
      outputTokens += meta.output_tokens ?? 0;
      continue;
    }
    const lc = m?.response_metadata?.tokenUsage;
    if (lc) {
      inputTokens += lc.promptTokens ?? 0;
      outputTokens += lc.completionTokens ?? 0;
      continue;
    }
    const usage = m?.response_metadata?.usage;
    if (usage) {
      inputTokens += usage.input_tokens ?? 0;
      outputTokens += usage.output_tokens ?? 0;
    }
  }

  return { inputTokens, outputTokens };
}

// The `task` tool's on_tool_start event nests its raw args as a JSON string
// under `data.input.input` (LangChain's tracer wraps every tool's inputs as
// `{ input: <string|object> }`), not a parsed object with `subagent_type`
// directly — so this has to unwrap and parse it defensively.
function extractSubagentName(rawInput: any): string | undefined {
  const inner = rawInput?.input ?? rawInput;
  if (!inner) return undefined;
  if (typeof inner === "object") return inner.subagent_type;
  if (typeof inner === "string") {
    try {
      return JSON.parse(inner)?.subagent_type;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

const runDeepAgentWithEvents = async (
  agent: any,
  messages: any[],
  config: { configurable: { thread_id: string }; recursionLimit: number; signal: AbortSignal },
  event: any,
  nodeName: string,
  controller: AbortController,
  requestApproval: (nodeName: string, toolName: string, args: any) => Promise<boolean>,
): Promise<{ finalState: any }> => {
  event.reply("node-start", { nodeName });
  let chainDepth = 0;

  // While delegating, every chunk needs to be attributed to whichever node
  // is actually producing it — the orchestrator while it's talking/calling
  // `task`, then the sub-agent for everything inside that delegation, then
  // back to the orchestrator once it returns. `baseDepth` records chainDepth
  // at the moment a sub-agent starts, so its own chunks can be classified
  // output-vs-thinking relative to its own nesting instead of the absolute
  // depth (which is now offset by however many levels delegation added).
  type Attribution = { name: string; baseDepth: number };
  const attributionStack: Attribution[] = [{ name: nodeName, baseDepth: 0 }];
  const currentAttribution = () => attributionStack[attributionStack.length - 1];
  // Maps a `task` tool call's run_id to the attribution it pushed, so the
  // matching on_tool_end can pop exactly that entry back off.
  const activeSubagentRuns = new Map<string, Attribution>();

  const consumeStream = async (stream: any) => {
    try {
      for await (const chunk of withInactivityTimeout(
        stream,
        NODE_INACTIVITY_TIMEOUT_MS,
        nodeName,
      )) {
        if (controller.signal.aborted) break;
        const eventType = chunk.event;
        const { name: attributedNode, baseDepth } = currentAttribution();

        if (eventType === "on_chain_start") {
          chainDepth++;
          event.reply("node-chain-start", {
            nodeName: attributedNode,
            name: chunk.name,
            id: chunk.run_id,
          });
        } else if (eventType === "on_chain_end") {
          chainDepth--;
          event.reply("node-chain-end", {
            nodeName: attributedNode,
            name: chunk.name,
            id: chunk.run_id,
          });
        } else if (eventType === "on_chat_model_stream") {
          const text = chunk.data?.chunk?.content;
          if (text) {
            // relDepth 1 → outer graph chain (ignore raw)
            // relDepth 2 → main model generation → node-stream (output)
            // relDepth >= 3 → nested reasoning/tool-call → node-thinking
            const relDepth = chainDepth - baseDepth;
            if (relDepth > 2) {
              event.reply("node-thinking", { nodeName: attributedNode, chunk: text });
            } else {
              event.reply("node-stream", { nodeName: attributedNode, chunk: text });
            }
          }
        } else if (eventType === "on_tool_start") {
          event.reply("node-tool-call", { nodeName: attributedNode, toolName: chunk.name });
          if (chunk.name === "task") {
            const subagentName = extractSubagentName(chunk.data?.input);
            if (subagentName) {
              const entry: Attribution = { name: subagentName, baseDepth: chainDepth };
              activeSubagentRuns.set(chunk.run_id, entry);
              attributionStack.push(entry);
              event.reply("node-start", { nodeName: subagentName });
            }
          }
        } else if (eventType === "on_tool_end") {
          if (chunk.name === "task") {
            const entry = activeSubagentRuns.get(chunk.run_id);
            if (entry) {
              activeSubagentRuns.delete(chunk.run_id);
              const idx = attributionStack.lastIndexOf(entry);
              if (idx !== -1) attributionStack.splice(idx, 1);
              event.reply("node-finished", { nodeName: entry.name });
            }
          }
          event.reply("node-tool-finished", {
            nodeName: currentAttribution().name,
            toolName: chunk.name,
            status: "success",
          });
        }
      }
    } finally {
      // A stream can end abruptly mid-delegation — the HITL approval
      // interrupt short-circuits the sub-agent's chain without emitting
      // `on_tool_end`/`on_chain_end` for it — leaving stale attribution
      // entries behind. If they aren't popped, the orchestrator's
      // post-resume reply chunks get attributed to the sub-agent node
      // (as node-thinking) and the orchestrator's canvas output stays
      // empty even though the model produced real output tokens.
      for (const [runId, entry] of activeSubagentRuns) {
        activeSubagentRuns.delete(runId);
        const idx = attributionStack.lastIndexOf(entry);
        if (idx !== -1) attributionStack.splice(idx, 1);
      }
    }
  };

  let stream = agent.streamEvents({ messages }, { version: "v2", ...config });
  await consumeStream(stream);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (controller.signal.aborted) break;

    const state = await agent.getState(config);
    const interruptedTask = state.tasks?.find((t: any) => t.interrupts?.length > 0);
    if (!interruptedTask) break;

    const interruptValue = interruptedTask.interrupts[0].value;
    const actionRequests = interruptValue.actionRequests ?? [];

    // Resume needs exactly one decision per pending action request, in
    // order — approving/rejecting only the first left the rest unanswered
    // and deepagents rejects the resume as a decision-count mismatch.
    const decisions: { type: "approve" | "reject" }[] = [];
    for (const request of actionRequests) {
      const approved = await requestApproval(nodeName, request.name || "", request.args || null);
      decisions.push({ type: approved ? "approve" : "reject" });
    }

    // Each streamEvents call starts a fresh top-level chain execution, so
    // chainDepth must be reset — otherwise the post-interrupt stream's
    // chunks sit at a leftover depth offset and misclassify the
    // orchestrator's reply as nested "thinking" instead of output.
    chainDepth = 0;
    stream = agent.streamEvents(
      new Command({
        resume: { decisions },
      }),
      { version: "v2", ...config },
    );
    await consumeStream(stream);
  }

  const finalState = await agent.getState(config);
  event.reply("node-finished", { nodeName, finalText: extractFinalText(finalState) });
  return { finalState };
};

const MAX_CONTINUOUS_ITERATIONS = 10;

export const runAgentOrchestration = async (
  event: any,
  nodes: nodes[],
  useremail: string,
  encryptkey: Servicefetch[],
  controller: AbortController,
  checkpointer: MemorySaver,
  requestApproval: (nodeName: string, toolName: string, args: any) => Promise<boolean>,
  simultaneous?: boolean,
  initialMessages?: { role: string; content: string }[],
  memoryContext?: string,
  continuous?: boolean,
  edges?: { source: string; target: string }[],
): Promise<{ messages: any[]; usageData: NodeUsage[] }> => {
  const keyMap: Record<string, string> = {};
  const hostMap: Record<string, string> = {};
  encryptkey.forEach((item) => {
    const provider = item.provider.toLowerCase();
    keyMap[provider] = item.apiKey;
    if (item.host) {
      hostMap[provider] = item.host;
    } else if (provider === "ollama") {
      // Backward compat: old JSON-string in apiKey
      try {
        const parsed = JSON.parse(item.apiKey);
        if (parsed.host) hostMap[provider] = parsed.host;
      } catch {
        /* plain URL or actual API key */
      }
    }
  });

  // Nodes arrive pre-sorted from the frontend (topological order when edges exist)
  let activenode = nodes;
  if (activenode.length === 0) {
    throw new Error("No nodes to execute. Please add at least one node.");
  }

  // A node whose Role is set to "Orchestrator" delegates to the nodes
  // connected to it by an edge (in either direction) as sub-agents (via
  // deepagents' built-in `task` tool) instead of them running as separate
  // workflow steps.
  const orchestratorNode = activenode.find((n) => n.actor?.trim().toLowerCase() === "orchestrator");
  let workerNodes: nodes[] = [];
  if (orchestratorNode) {
    const connectedIds = new Set(
      (edges ?? [])
        .filter((e) => e.source === orchestratorNode.id || e.target === orchestratorNode.id)
        .map((e) => (e.source === orchestratorNode.id ? e.target : e.source)),
    );
    workerNodes = activenode.filter((n) => n !== orchestratorNode && connectedIds.has(n.id));

    if (workerNodes.length === 0) {
      throw new Error(
        `"${orchestratorNode.name}" is an Orchestrator but has no sub-agents connected. Connect it to at least one other node on the canvas before running.`,
      );
    }
    activenode = [orchestratorNode];
  }

  const agents: any[] = [];
  for (const n of activenode) {
    try {
      const subagents =
        n === orchestratorNode
          ? workerNodes.map((w) => buildSubAgentSpec(w, memoryContext))
          : undefined;
      const agent = await createNodeDeepAgent(
        n,
        keyMap,
        useremail,
        checkpointer,
        hostMap,
        memoryContext,
        subagents,
      );
      agents.push(agent);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to create agent for node "${n.name}":`, msg);
      throw new Error(`Node "${n.name}" (${n.provider}/${n.model}) failed to initialize: ${msg}`);
    }
  }

  const thread_id = crypto.randomUUID();
  const config = { configurable: { thread_id }, recursionLimit: 100, signal: controller.signal };

  let messages: any[] = (initialMessages ?? []).map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
  );
  const usageData: NodeUsage[] = [];

  const runAllNodesOnce = async (
    iterationMsgs: any[],
  ): Promise<{ msgs: any[]; usage: NodeUsage[] }> => {
    const iterUsage: NodeUsage[] = [];
    let iterMsgs = [...iterationMsgs];

    if (simultaneous) {
      const results = await Promise.allSettled(
        agents.map((agent, i) =>
          runDeepAgentWithEvents(
            agent,
            iterMsgs,
            config,
            event,
            activenode[i].name,
            controller,
            requestApproval,
          ),
        ),
      );
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === "rejected") {
          const msg =
            result.reason instanceof Error ? result.reason.message : String(result.reason);
          console.error(`Node "${activenode[i].name}" failed:`, msg);
          event.reply("node-finished", { nodeName: activenode[i].name });
          continue;
        }
        const { finalState } = result.value;
        if (finalState?.values?.messages) {
          iterMsgs = iterMsgs.concat(finalState.values.messages);
        }
        const { inputTokens, outputTokens } = extractTokenUsage(finalState);
        iterUsage.push({
          nodeName: activenode[i].name,
          agent: activenode[i].name,
          provider: activenode[i].provider,
          model: activenode[i].model,
          inputTokens,
          outputTokens,
          latencyMs: 0,
        });
      }
    } else {
      for (let i = 0; i < agents.length; i++) {
        if (controller.signal.aborted) break;
        const nodeStart = Date.now();
        try {
          const { finalState } = await runDeepAgentWithEvents(
            agents[i],
            iterMsgs,
            config,
            event,
            activenode[i].name,
            controller,
            requestApproval,
          );
          if (finalState?.values?.messages) {
            iterMsgs = finalState.values.messages;
          }
          const { inputTokens, outputTokens } = extractTokenUsage(finalState);
          iterUsage.push({
            nodeName: activenode[i].name,
            agent: activenode[i].name,
            provider: activenode[i].provider,
            model: activenode[i].model,
            inputTokens,
            outputTokens,
            latencyMs: Date.now() - nodeStart,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`Node "${activenode[i].name}" failed:`, msg);
          event.reply("node-finished", { nodeName: activenode[i].name });
          throw err;
        }
      }
    }

    return { msgs: iterMsgs, usage: iterUsage };
  };

  if (continuous) {
    // Continuous loop mode: re-run all agents repeatedly until user aborts or max iterations
    for (let iteration = 0; iteration < MAX_CONTINUOUS_ITERATIONS; iteration++) {
      if (controller.signal.aborted) break;
      console.log(`Continuous loop iteration ${iteration + 1}/${MAX_CONTINUOUS_ITERATIONS}`);
      event.reply("loop-iteration", { iteration: iteration + 1, max: MAX_CONTINUOUS_ITERATIONS });

      const { msgs, usage } = await runAllNodesOnce(messages);
      messages = msgs;
      usageData.push(...usage);
    }
    console.log("Continuous loop finished");
  } else {
    const { msgs, usage } = await runAllNodesOnce(messages);
    messages = msgs;
    usageData.push(...usage);
  }

  return { messages, usageData };
};
