import { z } from "zod";
import { tool } from "@langchain/core/tools";
import util from "util";
import child_process from "child_process";

const exec = util.promisify(child_process.exec);

let commandCount = 0;
let lastCommand = "";

const BLOCKED_PATTERNS = [
  /\brm\b/i,
  /\bdel\b/i,
  /\bformat\b/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bmkfs\b/i,
  /\bdd\b/i,
  /\bfdisk\b/i,
  /\bparted\b/i,
  /\bmount\b/i,
  /\bchmod\b/i,
  /\bchown\b/i,
  /\bsudo\b/i,
  /\bsu\b/i,
  /\bpasswd\b/i,
  /\busermod\b/i,
  /\buserdel\b/i,
  /\bgroupdel\b/i,
  /\bpoweroff\b/i,
  /\bhalt\b/i,
  /\bsystemctl\b/i,
  /\bsc\b/i,
  /\bschtasks\b/i,
  /\bbcdedit\b/i,
  /\bvssadmin\b/i,
  /\bwevtutil\b/i,
  /\bwusa\b/i,
  /\breg\b/i,
  /\bregedit\b/i,
  /\bdiskpart\b/i,
  /\bbootcfg\b/i,
  /\bbootsect\b/i,
  /\bcmdkey\b/i,
  /\brunas\b/i,
  /\bwinrm\b/i,
  /\bwmic\b/i,
  /\bcim\b/i,
  /\bnet\s+user\b/i,
  /\bnet\s+localgroup\b/i,
  /\bnet\s+group\b/i,
  /\bstart-process\b/i,
  /\bstop-process\b/i,
  /\binvoke-webrequest\b/i,
  /\binvoke-restmethod\b/i,
  /\bnew-object\b/i,
  /\badd-type\b/i,
  /\bassembly\b/i,
  /\bremove-item\b/i,
  /\bclear-host\b/i,
  /\bstop-computer\b/i,
  /\brestart-computer\b/i,
  /\btelinit\b/i,
  /\binit\b/i,
  /\bwget\b/i,
  /\bcurl\b/i,
  /python.*-c/i,
  /perl.*-e/i,
  /ruby.*-e/i,
  /node.*-e/i,
  /bash.*-c/i,
  /powershell.*-c/i,
  /cmd.*\/c/i,
  /\bcertutil\b/i,
  /\bbitsadmin\b/i,
  /\bmshta\b/i,
  /\bwscript\b/i,
  /\bcscript\b/i,
  /\bpowershell.*encodedcommand/i,
  /\bcrontab\b/i,
  /\bat\b.*\d/i,
  /\bbatch\b/i,
];

const isBlocked = (command: string): boolean => {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(command));
};

export const commandtool = tool(
  async ({ command }) => {
    try {
      if (!command || typeof command !== "string" || command.length > 500) {
        return "Invalid command input.";
      }

      if (commandCount >= 20) {
        return "Too many command attempts. Ask user for clarification.";
      }

      if (command === lastCommand) {
        return "Command already executed. Stopping to avoid loop.";
      }

      if (isBlocked(command)) {
        return "Dangerous command blocked.";
      }

      if (/[;&|`$(){}\n\r\\]/.test(command)) {
        return "Chained, multi-line, or escape command blocked.";
      }

      const trimmed = command.trim();
      if (!/^[a-zA-Z0-9_\-./\s=:+"',<>?@!%~[\]]+$/.test(trimmed)) {
        return "Command contains disallowed characters.";
      }

      commandCount++;
      lastCommand = command;

      const { stdout, stderr } = await exec(`${command}`, {
        timeout: 8000,
        windowsHide: true,
      });

      if (!stdout && !stderr) {
        return "Command executed successfully.";
      }

      return stdout || stderr;
    } catch (err) {
      return "Command failed. Do NOT retry. Ask user for help.";
    }
  },
  {
    name: "run_command",
    description:
      "Execute a system command safely. Never retry failed commands. Maximum 20 attempts total.",
    schema: z.object({
      command: z.string().describe("The full shell command to execute"),
    }),
  },
);
