import { z } from "zod";
import { tool } from "@langchain/core/tools";
import util from "util";
import child_process from "child_process";

const exec = util.promisify(child_process.exec);

let commandCount = 0;
let lastCommand = "";

export const commandtool = tool(
    async ({ command }) => {
        try {
            if (commandCount >= 20) {
                return " Too many command attempts. Ask user for clarification.";
            }

            if (command === lastCommand) {
                return " Command already executed. Stopping to avoid loop.";
            }

            const blocked = ["rm", "del /s", "format", "shutdown", "reboot"];
            if (blocked.some((cmd) => command.toLowerCase().includes(cmd))) {
                return " Dangerous command blocked.";
            }

            commandCount++;
            lastCommand = command;

            const { stdout, stderr } = await exec(`${command}`, {
                timeout: 8000,
            });

            if (!stdout && !stderr) {
                return " Command executed successfully.";
            }

            return stdout || stderr;

        } catch (err) {
            return " Command failed. Do NOT retry. Ask user for help.";
        }
    },
    {
        name: "run_command",
        description:
            "Execute a system command safely. Never retry failed commands. Maximum 3 attempts total.",
        schema: z.object({
            command: z.string().describe("The full shell command to execute"),
        }),
    }
);