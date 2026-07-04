import { type MemorySaver, Command } from "@langchain/langgraph";
import { nodes } from "../../src/shared/types/globaltype";
import { Servicefetch } from "../../src/features/services/types";
import { createNodeDeepAgent } from "./node-deepagent";
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
    const lastMsg = messages[messages.length - 1] as any;
    if (!lastMsg) return { inputTokens: 0, outputTokens: 0 };

    const meta = lastMsg?.usage_metadata;
    if (meta) {
        return {
            inputTokens: meta.input_tokens ?? 0,
            outputTokens: meta.output_tokens ?? 0,
        };
    }
    const lc = lastMsg?.response_metadata?.tokenUsage;
    if (lc) {
        return {
            inputTokens: lc.promptTokens ?? 0,
            outputTokens: lc.completionTokens ?? 0,
        };
    }
    const usage = lastMsg?.response_metadata?.usage;
    if (usage) {
        return {
            inputTokens: usage.input_tokens ?? 0,
            outputTokens: usage.output_tokens ?? 0,
        };
    }
    return { inputTokens: 0, outputTokens: 0 };
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
    event.reply('node-start', { nodeName });
    let chainDepth = 0;

    const consumeStream = async (stream: any) => {
        for await (const chunk of stream) {
            if (controller.signal.aborted) break;
            const eventType = chunk.event;

            if (eventType === "on_chain_start") {
                chainDepth++;
                event.reply('node-chain-start', { nodeName, name: chunk.name, id: chunk.run_id });
            }
            else if (eventType === "on_chain_end") {
                chainDepth--;
                event.reply('node-chain-end', { nodeName, name: chunk.name, id: chunk.run_id });
            }
            else if (eventType === "on_chat_model_stream") {
                const text = chunk.data?.chunk?.content;
                if (text) {
                    if (chainDepth > 0) {
                        event.reply('node-thinking', { nodeName, chunk: text });
                    } else {
                        event.reply('node-stream', { nodeName, chunk: text });
                    }
                }
            }
            else if (eventType === "on_tool_start") {
                event.reply('node-tool-call', { nodeName, toolName: chunk.name });
            }
            else if (eventType === "on_tool_end") {
                event.reply('node-tool-finished', { nodeName, toolName: chunk.name, status: "success" });
            }
        }
    };

    let stream = agent.streamEvents({ messages }, { version: "v2", ...config });
    await consumeStream(stream);

    while (true) {
        if (controller.signal.aborted) break;

        const state = await agent.getState(config);
        const interruptedTask = state.tasks?.find((t: any) => t.interrupts?.length > 0);
        if (!interruptedTask) break;

        const interruptValue = interruptedTask.interrupts[0].value;
        const actionRequests = interruptValue.actionRequests ?? [];
        const firstRequest = actionRequests[0] || {};

        const approved = await requestApproval(nodeName, firstRequest.name || "", firstRequest.args || null);

        stream = agent.streamEvents(
            new Command({ resume: { decisions: [{ type: approved ? "approve" as const : "reject" as const }] } }),
            { version: "v2", ...config },
        );
        await consumeStream(stream);
    }

    const finalState = await agent.getState(config);
    event.reply('node-finished', { nodeName });
    return { finalState };
};

export const runAgentOrchestration = async (
    event: any,
    nodes: nodes[],
    useremail: string,
    encryptkey: Servicefetch[],
    controller: AbortController,
    checkpointer: MemorySaver,
    requestApproval: (nodeName: string, toolName: string, args: any) => Promise<boolean>,
    firstnode?: string,
    lastnode?: string,
    targetnode?: string,
    simultaneous?: boolean,
    initialMessages?: any[],
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
            } catch { /* plain URL or actual API key */ }
        }
    });

    let activenode: nodes[];
    if (firstnode && lastnode) {
        let a = nodes.findIndex(n => n.name === firstnode);
        let b = nodes.findIndex(n => n.name === lastnode);
        if (a === -1 || b === -1) {
            throw new Error(`Node not found: ${a === -1 ? firstnode : lastnode}`);
        }
        if (a > b) [a, b] = [b, a];
        activenode = nodes.slice(a, b + 1);
    } else if (targetnode) {
        activenode = nodes.filter(n => n.name === targetnode);
        if (activenode.length === 0) {
            throw new Error(`Node "${targetnode}" not found. Available nodes: ${nodes.map(n => n.name).join(", ")}`);
        }
    } else {
        activenode = nodes;
    }

    if (activenode.length === 0) {
        throw new Error("No nodes to execute. Please add at least one node.");
    }

    const agents: any[] = [];
    for (const n of activenode) {
        try {
            const agent = await createNodeDeepAgent(n, keyMap, useremail, checkpointer, hostMap);
            agents.push(agent);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`Failed to create agent for node "${n.name}":`, msg);
            throw new Error(`Node "${n.name}" (${n.provider}/${n.model}) failed to initialize: ${msg}`);
        }
    }

    const thread_id = crypto.randomUUID();
    const config = { configurable: { thread_id }, recursionLimit: 100, signal: controller.signal };

    let messages: any[] = initialMessages ? [...initialMessages] : [];
    const usageData: NodeUsage[] = [];

    if (simultaneous) {
        const results = await Promise.allSettled(
            agents.map((agent, i) =>
                runDeepAgentWithEvents(agent, messages, config, event, activenode[i].name, controller, requestApproval),
            ),
        );
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === "rejected") {
                const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
                console.error(`Node "${activenode[i].name}" failed:`, msg);
                event.reply('node-finished', { nodeName: activenode[i].name });
                continue;
            }
            const { finalState } = result.value;
            if (finalState?.values?.messages) {
                messages = messages.concat(finalState.values.messages);
            }
            const { inputTokens, outputTokens } = extractTokenUsage(finalState);
            if (inputTokens || outputTokens) {
                usageData.push({
                    nodeName: activenode[i].name,
                    agent: activenode[i].name,
                    provider: activenode[i].provider,
                    model: activenode[i].model,
                    inputTokens,
                    outputTokens,
                    latencyMs: 0,
                });
            }
        }
    } else {
        for (let i = 0; i < agents.length; i++) {
            if (controller.signal.aborted) break;
            const nodeStart = Date.now();
            try {
                const { finalState } = await runDeepAgentWithEvents(
                    agents[i], messages, config, event, activenode[i].name, controller, requestApproval,
                );
                if (finalState?.values?.messages) {
                    messages = finalState.values.messages;
                }
                const { inputTokens, outputTokens } = extractTokenUsage(finalState);
                if (inputTokens || outputTokens) {
                    usageData.push({
                        nodeName: activenode[i].name,
                        agent: activenode[i].name,
                        provider: activenode[i].provider,
                        model: activenode[i].model,
                        inputTokens,
                        outputTokens,
                        latencyMs: Date.now() - nodeStart,
                    });
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error(`Node "${activenode[i].name}" failed:`, msg);
                event.reply('node-finished', { nodeName: activenode[i].name });
                throw err;
            }
        }
    }

    return { messages, usageData };
};
