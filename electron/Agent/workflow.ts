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

  // Maps a `task` tool call's run_id to the sub-agent node it delegated to,
  // so that node can also show as running on the canvas during delegation.
  const activeSubagentRuns = new Map<string, string>();

  const consumeStream = async (stream: any) => {
    for await (const chunk of stream) {
      if (controller.signal.aborted) break;
      const eventType = chunk.event;

      if (eventType === "on_chain_start") {
        chainDepth++;
        event.reply("node-chain-start", { nodeName, name: chunk.name, id: chunk.run_id });
      } else if (eventType === "on_chain_end") {
        chainDepth--;
        event.reply("node-chain-end", { nodeName, name: chunk.name, id: chunk.run_id });
      } else if (eventType === "on_chat_model_stream") {
        const text = chunk.data?.chunk?.content;
        if (text) {
          // chainDepth 1 → outer graph chain (ignore raw)
          // chainDepth 2 → main model generation → node-stream (output)
          // chainDepth >= 3 → nested reasoning/tool-call → node-thinking
          if (chainDepth > 2) {
            event.reply("node-thinking", { nodeName, chunk: text });
          } else {
            event.reply("node-stream", { nodeName, chunk: text });
          }
        }
      } else if (eventType === "on_tool_start") {
        event.reply("node-tool-call", { nodeName, toolName: chunk.name });
        if (chunk.name === "task") {
          const subagentName = chunk.data?.input?.subagent_type;
          if (subagentName) {
            activeSubagentRuns.set(chunk.run_id, subagentName);
            event.reply("node-start", { nodeName: subagentName });
          }
        }
      } else if (eventType === "on_tool_end") {
        event.reply("node-tool-finished", { nodeName, toolName: chunk.name, status: "success" });
        if (chunk.name === "task") {
          const subagentName = activeSubagentRuns.get(chunk.run_id);
          if (subagentName) {
            activeSubagentRuns.delete(chunk.run_id);
            event.reply("node-finished", { nodeName: subagentName });
          }
        }
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
    const firstRequest = actionRequests[0] || {};

    const approved = await requestApproval(
      nodeName,
      firstRequest.name || "",
      firstRequest.args || null,
    );

    stream = agent.streamEvents(
      new Command({
        resume: { decisions: [{ type: approved ? ("approve" as const) : ("reject" as const) }] },
      }),
      { version: "v2", ...config },
    );
    await consumeStream(stream);
  }

  const finalState = await agent.getState(config);
  event.reply("node-finished", { nodeName });
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
