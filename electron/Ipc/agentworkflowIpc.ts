import { ipcMain } from "electron";
import { createAgentWorkflow } from "../Agent/workflow";
import { getusertoken } from "./authIpc";

export const RunAgent = () => {
    ipcMain.on('run-workflow', async (event, data) => {
        const { input, nodes, encryptkey, firstnode, lastnode, targetnode, useremail, simultaneous } = data;

        const token = getusertoken();
        if (!token) {
            throw new Error("No Auth Token Found.");
        }

        process.env.CURRENT_AUTH_TOKEN = token;

        try {
            const appGraph = createAgentWorkflow(event, nodes, useremail, encryptkey, firstnode, lastnode, targetnode, simultaneous);
            console.log("Workflow Started in Main Process");

            await appGraph.invoke({
                input: input,
                messages: [],
                retryCount: 0
            }, {
                recursionLimit: 100
            });

            console.log(" Workflow Completed");
        } catch (error) {
            console.error(" IPC Workflow Error:", error);
            event.reply('node-error', { message: error instanceof Error ? error.message : String(error) });
        }
    });
}