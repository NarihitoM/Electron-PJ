import { tool } from "@langchain/core/tools";
import { z } from "zod";
import os from "os";

export const systeminfotool = tool(
  async () => {
    try {
      const info = {
        platform: os.platform(),
        release: os.release(),
        architecture: os.arch(),
        hostname: os.hostname(),
        cpus:
          os.cpus().length > 0 ? `${os.cpus()[0].model} (${os.cpus().length} cores)` : "Unknown",
        totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB`,
        freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)} GB`,
        uptime: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
        userInfo: os.userInfo().username,
        tempDir: os.tmpdir(),
        homeDir: os.homedir(),
      };
      return Object.entries(info)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    } catch (err: any) {
      return `System info error: ${err.message}`;
    }
  },
  {
    name: "get_system_info",
    description:
      "Get system information including OS, platform, architecture, CPU, memory, hostname, and uptime.",
    schema: z.object({}),
  },
);
