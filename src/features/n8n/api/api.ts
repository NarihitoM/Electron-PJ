import { Server } from "../../../shared/config/axioconfig";
import { fetchurl } from "../../../shared/config/fetchconfig";
import {
  returnn8nconfig,
  returnn8nmsg,
  returnn8nfeedback,
  returnn8ntest,
  returnn8ncrondata,
  n8ncrondata,
} from "../types/type";

export const n8nauth = {
  testConnection: async (
    n8nUrl: string,
    authType: string,
    authValue?: string,
  ): Promise<returnn8ntest> => {
    const response = await Server.post("/n8n/api/test", { n8nUrl, authType, authValue });
    return response.data;
  },
  connect: async (
    n8nUrl: string,
    authType: string,
    authValue?: string,
  ): Promise<returnn8nfeedback> => {
    const response = await Server.post("/n8n/api/connect", { n8nUrl, authType, authValue });
    return response.data;
  },
  getConfig: async (): Promise<returnn8nconfig> => {
    const response = await Server.get("/n8n/api/config");
    return response.data;
  },
  disconnect: async (): Promise<returnn8nfeedback> => {
    const response = await Server.post("/n8n/api/disconnect");
    return response.data;
  },
  fetchn8nmsg: async (cursor?: string, limit?: number): Promise<returnn8nmsg> => {
    const response = await Server.get("/n8n/api/n8nmsg", {
      params: {
        ...(cursor !== undefined ? { cursor } : {}),
        ...(limit !== undefined ? { limit } : {}),
      },
    });
    return response.data;
  },
  sendmessage: async (
    content: string,
    provider: string,
    model: string,
    n8nUrl: string,
    authType: string,
    authValue: string | undefined,
    images: string[] | undefined,
    onChunk?: (chunk: string) => void,
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
    const response = await fetch(`${fetchurl}/n8n/api/n8nagentmsg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        content,
        provider,
        model,
        n8nUrl,
        authType,
        authValue,
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
            if (onChunk) onChunk(data.chunk);
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
  n8ndeleteservice: async (): Promise<returnn8nfeedback> => {
    const response = await Server.post("/n8n/api/n8ndeleteservice");
    return response.data;
  },
  n8ndeletemessage: async (): Promise<returnn8nfeedback> => {
    const response = await Server.post("/n8n/api/n8ndeletemessage");
    return response.data;
  },
  n8ncroncreate: async (data: n8ncrondata): Promise<returnn8nfeedback> => {
    const response = await Server.post("/n8n/api/n8ncroncreate", { data });
    return response.data;
  },
  n8ncronget: async (): Promise<returnn8ncrondata> => {
    const response = await Server.get("/n8n/api/n8ncronget");
    return response.data;
  },
};
