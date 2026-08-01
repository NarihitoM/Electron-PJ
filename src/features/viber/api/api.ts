import { Server } from "../../../shared/config/axioconfig";
import { fetchurl } from "../../../shared/config/fetchconfig";
import { returnviberacc, returnviberfeedback, returnvibermsg } from "../types/type";

export const viberauth = {
  viberconnectinfo: async (): Promise<{ botUri: string }> => {
    const response = await Server.post("/viber/api/authurl");
    return response.data;
  },
  vibercheckstatus: async (): Promise<{ success: boolean }> => {
    const response = await Server.get("/viber/api/checkstatus");
    return response.data;
  },
  viberacc: async (): Promise<returnviberacc> => {
    const response = await Server.get("/viber/api/viberacc");
    return response.data;
  },
  fetchvibermessage: async (cursor?: string, limit?: number): Promise<returnvibermsg> => {
    const response = await Server.get("/viber/api/fetchmessage", {
      params: {
        ...(cursor !== undefined ? { cursor } : {}),
        ...(limit !== undefined ? { limit } : {}),
      },
    });
    return response.data;
  },
  deleteviberservice: async (): Promise<returnviberfeedback> => {
    const response = await Server.post("/viber/api/deleteservice");
    return response.data;
  },
  deletevibermsg: async (): Promise<returnviberfeedback> => {
    const response = await Server.post("/viber/api/deletemessage");
    return response.data;
  },
  sendmessage: async (
    content: string,
    provider: string,
    model: string,
    images: string[] | undefined,
    onChunk: (chunk: string) => void,
    onThinking?: (chunk: string) => void,
    onStatus?: (status: {
      type: string;
      step: string;
      tool?: string;
      name?: string;
      input?: string;
      output?: string;
      id: string;
      query: string;
      result: string;
      error: string;
    }) => void,
    onApproval?: (approval: {
      thread_id: string;
      tool_calls: Array<{ name: string; query: any; id: string }>;
    }) => void,
    onImage?: (url: string) => void,
    signal?: AbortSignal,
    reasoningLevel?: "" | "low" | "medium" | "high",
  ): Promise<void> => {
    const token = await (window as any).api.getToken();
    const response = await fetch(`${fetchurl}/viber/api/sendmessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        content,
        provider,
        model,
        images,
        reasoningLevel: reasoningLevel || undefined,
      }),
      signal,
    });

    if (!response.ok) throw new Error("Failed to connect to stream");
    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");

      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const data = JSON.parse(line);

          if (data.type === "text") {
            onChunk(data.chunk);
          } else if (data.type === "thinking") {
            if (onThinking) onThinking(data.chunk);
          } else if (data.type === "status" || data.type === "chain") {
            if (onStatus) onStatus(data);
          } else if (data.type === "tool_approval_request") {
            if (onApproval) onApproval(data);
          } else if (data.type === "image") {
            if (onImage) onImage(data.url);
          } else if (data.type === "error") {
            throw new Error(data.message || data.error || "Server error during streaming");
          }
        } catch (e) {
          if (e instanceof Error && e.message.includes("Server error")) throw e;
          console.error("Error parsing NDJSON line:", e);
        }
      }
    }
  },
};
