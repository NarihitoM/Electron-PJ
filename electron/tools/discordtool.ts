import { tool } from "@langchain/core/tools";
import { z } from "zod";

const DISCORD_API = "https://discord.com/api/v10";

async function discordRequest(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${DISCORD_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${token}`,
      "User-Agent": "MultimateAgent/1.0",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

export const discordtool = tool(
  async ({ action, token, channel_id, guild_id, content, limit }) => {
    const authToken = token || process.env.VITE_DISCORD_BOT_TOKEN || "";
    if (!authToken) {
      return "Error: No Discord bot token available. Pass a token or configure VITE_DISCORD_BOT_TOKEN.";
    }

    try {
      switch (action) {
        case "send_message": {
          if (!channel_id) return "Error: channel_id is required to send a message.";
          if (!content) return "Error: content is required to send a message.";
          const { ok, status, data } = await discordRequest(
            authToken,
            `/channels/${channel_id}/messages`,
            { method: "POST", body: JSON.stringify({ content }) },
          );
          if (!ok) return `Discord error (${status}): ${JSON.stringify(data)}`;
          return `Message sent to channel ${channel_id} (id: ${data.id})`;
        }

        case "read_messages": {
          if (!channel_id) return "Error: channel_id is required to read messages.";
          const params = new URLSearchParams({ limit: String(limit || 20) });
          const { ok, status, data } = await discordRequest(
            authToken,
            `/channels/${channel_id}/messages?${params}`,
          );
          if (!ok) return `Discord error (${status}): ${JSON.stringify(data)}`;
          const messages = (data as any[]).map((m) => ({
            id: m.id,
            author: m.author?.username,
            content: m.content,
            timestamp: m.timestamp,
          }));
          return JSON.stringify(messages, null, 2);
        }

        case "list_channels": {
          if (!guild_id) return "Error: guild_id is required to list channels.";
          const { ok, status, data } = await discordRequest(
            authToken,
            `/guilds/${guild_id}/channels`,
          );
          if (!ok) return `Discord error (${status}): ${JSON.stringify(data)}`;
          const channels = (data as any[]).map((c) => ({ id: c.id, name: c.name, type: c.type }));
          return JSON.stringify(channels, null, 2);
        }

        default:
          return `Unknown action: ${action}`;
      }
    } catch (err: any) {
      return `Discord error: ${err.message}`;
    }
  },
  {
    name: "discord_action",
    description:
      "Interact with Discord via a bot token. Actions: send_message (post to a channel), read_messages (recent channel history), list_channels (channels in a guild/server). Requires a Discord bot token with the appropriate permissions.",
    schema: z.object({
      action: z
        .enum(["send_message", "read_messages", "list_channels"])
        .describe("Operation to perform"),
      token: z
        .string()
        .optional()
        .describe("Discord bot token (overrides VITE_DISCORD_BOT_TOKEN env var)"),
      channel_id: z
        .string()
        .optional()
        .describe("Discord channel ID, required for send_message and read_messages"),
      guild_id: z
        .string()
        .optional()
        .describe("Discord guild/server ID, required for list_channels"),
      content: z.string().optional().describe("Message text for send_message"),
      limit: z
        .number()
        .optional()
        .describe("Max messages to fetch for read_messages (default: 20)"),
    }),
  },
);
