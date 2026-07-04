import { ipcMain } from "electron";
import { runAgentOrchestration } from "../Agent/workflow";
import { getusertoken } from "./authIpc";
import { MemorySaver } from "@langchain/langgraph";
import { Server } from "../../src/shared/config/axioconfig";

let currentAbortController: AbortController | null = null;

async function logUsageToServer(usageData: any[], token: string | null) {
    if (!usageData.length) {
        console.log("No usage data to log");
        return;
    }
    for (const entry of usageData) {
        try {
            console.log("Logging usage:", entry);
            await Server.post("/dashboard/api/usage/log", {
                provider: entry.provider,
                model: entry.model,
                agent: entry.agent || "agent",
                inputTokens: entry.inputTokens || 0,
                outputTokens: entry.outputTokens || 0,
                latencyMs: entry.latencyMs || 0,
                success: entry.success !== false,
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
        } catch (err) {
            console.error("Failed to log usage:", err);
        }
    }
}

export const RunAgent = () => {
    ipcMain.on('run-workflow', async (event, data) => {
        const { nodes, encryptkey, firstnode, lastnode, targetnode, useremail, simultaneous, input } = data;

        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }

        const controller = new AbortController();
        currentAbortController = controller;

        const token = getusertoken();
        if (!token) {
            throw new Error("No Auth Token Found.");
        }

        process.env.CURRENT_AUTH_TOKEN = token;

        const checkpointer = new MemorySaver();

        const requestApproval = (nodeName: string, toolName: string, args: any): Promise<boolean> => {
            return new Promise<boolean>((resolve) => {
                const handler = (_: any, data: { approved: boolean }) => {
                    ipcMain.removeListener('tool-approval-response', handler);
                    resolve(data.approved);
                };
                ipcMain.on('tool-approval-response', handler);

                event.reply('tool-approval-request', { nodeName, toolName, args });
            });
        };

        try {
            const { usageData } = await runAgentOrchestration(
                event,
                nodes,
                useremail,
                encryptkey,
                controller,
                checkpointer,
                requestApproval,
                firstnode,
                lastnode,
                targetnode,
                simultaneous,
                input,
            );
            console.log("Workflow Completed");
            await logUsageToServer(usageData, token);
        } catch (error) {
            if ((error as any)?.name === 'AbortError') {
                console.log("Workflow aborted by user");
                return;
            }
            console.error("IPC Workflow Error:", error);
            // Log failed nodes to usage database
            const errorUsage = nodes.map((n: any) => ({
                provider: n.provider,
                model: n.model,
                agent: n.name || "agent",
                inputTokens: 0,
                outputTokens: 0,
                latencyMs: 0,
                success: false,
            }));
            await logUsageToServer(errorUsage, token);
            event.reply('node-error', { message: error instanceof Error ? error.message : String(error) });
        } finally {
            if (currentAbortController === controller) {
                currentAbortController = null;
                delete process.env.CURRENT_AUTH_TOKEN;
            }
        }
    });

    ipcMain.on('cancel-workflow', () => {
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }
    });
};
