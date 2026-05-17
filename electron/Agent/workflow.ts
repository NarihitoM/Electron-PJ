import { StateGraph, START, END } from "@langchain/langgraph";
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { getLLM } from "./provider";
import { AgentState } from "./state";
import { Servicefetch } from "@/types/servicetype";
import { nodes } from "@/types/globaltype";
import { toolRegistry } from "../tools/toolsregister";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createAgentWorkflow = (
    event: any,
    nodes: nodes[],
    useremail: string,
    encryptkey: Servicefetch[],
    firstnode?: string,
    lastnode?: string,
    targetnode?: string,
    simultaneous?: boolean,
) => {
    const keyMap: Record<string, string> = {};
    encryptkey.forEach((item) => {
        keyMap[item.provider.toLowerCase()] = item.apiKey;
    });

    let activenode: nodes[];

    if (firstnode && lastnode) {
        let firstindex = nodes.findIndex(n => n.name === firstnode);
        let secondindex = nodes.findIndex(n => n.name === lastnode);

        if (firstindex > secondindex) {
            [firstindex, secondindex] = [secondindex, firstindex];
        }
        activenode = nodes.slice(firstindex, secondindex + 1);
    }
    else if (targetnode) {
        activenode = nodes.filter(n => n.name === targetnode);
    } else {
        activenode = nodes;
    }

    const workflow = new StateGraph(AgentState);


    activenode.forEach((nodeConfig, index) => {
        const currentAgentName = nodeConfig.name;
        const currentToolNode = `Tools_${currentAgentName}`;
        const nextAgentName = activenode[index + 1] ? activenode[index + 1].name : END;

        workflow.addNode(nodeConfig.name, async (state) => {
            let llm: any = null;

            event.reply('node-start', { nodeName: nodeConfig.name });
            try {
                llm = await getLLM(nodeConfig, keyMap, useremail, nodeConfig.tool);

                //Extract Md File
                const masterTask = fs.readFileSync(path.join(__dirname, "..", 'electron', 'skills', 'agentskill.md'), 'utf-8');

                const history = state.messages.length > 0
                    ? state.messages
                    : (state.input || []).map(m =>
                        m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
                    );

                const toolList = toolRegistry[nodeConfig.tool] || [];
                const toolNamesString = toolList.map((t: any) => t.name).join(", ") || "No tools assigned";

                const prompt = [
                    new SystemMessage(
                        masterTask
                            .replace("{nodeConfig.role}", nodeConfig.tool)
                            .replace("{nodeConfig.actor}", nodeConfig.actor)
                            .replace("{nodeConfig.tool}", toolNamesString)
                            .replace("{nodeConfig.systemPrompt}", nodeConfig.systemPrompt!)
                    ),
                    ...history,
                ];

                const response = await llm.invoke(prompt);

                event.reply('node-stream', { nodeName: nodeConfig.name, chunk: response.content });

                return {
                    messages: [response],
                    activeagent: nodeConfig.name,
                };
            } catch (err: unknown) {
                throw new Error("It seems something went wrong.")
            } finally {
                if (llm) {
                    const target = (llm as any).bound || llm;
                    const keysToClear = ["apiKey", "anthropicApiKey", "googleApiKey", "apiKey_", "client"];
                    
                    keysToClear.forEach((key) => {
                        if (key in target) {
                            try { target[key] = null; } 
                            catch {  }
                        }
                    });
                    
                    llm = null;
                }
            }
        });

        workflow.addNode(currentToolNode, async (state) => {
            const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

            const toolResults = await Promise.all((lastMessage.tool_calls || []).map(async (toolCall) => {
                const agentTools = toolRegistry[nodeConfig.tool] || [];

                const tool = agentTools.find((t: { name: string; }) => t.name === toolCall.name);

                if (tool) {
                    event.reply('node-tool-call', { nodeName: nodeConfig.name, toolName: toolCall.name });

                    const result = await tool.invoke(toolCall.args);

                    event.reply('node-tool-finished', { nodeName: nodeConfig.name, toolName: toolCall.name, status: "success" });

                    return new ToolMessage({
                        tool_call_id: toolCall.id!,
                        content: typeof result === 'string' ? result : JSON.stringify(result)
                    });
                } else {
                    return new ToolMessage({
                        tool_call_id: toolCall.id!,
                        content: `Error: Tool ${toolCall.name} not found for agent ${nodeConfig.name}`
                    });
                }
            }));
            return { messages: toolResults };
        });

        workflow.addConditionalEdges(
            nodeConfig.name as any,
            (state) => {
                const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

                if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
                    return currentToolNode;
                }

                event.reply('node-finished', { nodeName: nodeConfig.name });
                return simultaneous ? END : nextAgentName;
            },
            {
                [currentToolNode]: currentToolNode,
                [nextAgentName]: nextAgentName,
                [END]: END
            } as Record<string, any>
        );

        workflow.addEdge(currentToolNode as any, currentAgentName as any);
    });


    //run simultaneous
    workflow.addConditionalEdges(
        START,
        () => {
            if (simultaneous) {
                return activenode.map(n => n.name);
            } else {
                return activenode[0].name;
            }
        }
    );

    return workflow.compile();
};

