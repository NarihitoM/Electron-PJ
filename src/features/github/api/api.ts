import { Server } from "../../../shared/config/axioconfig";
import { fetchurl } from "../../../shared/config/fetchconfig";
import {
  returngithubacc,
  returngithubfeedback,
  returngithubmsg,
  returngithubcrondata,
  githubcrondata,
} from "../types/type";

export const githubauth = {
  githubstate: async (): Promise<{ stateId: string }> => {
    const response = await Server.post("/github/api/authurl");
    return response.data;
  },
  githubcheckstatus: async (): Promise<{ success: boolean }> => {
    const response = await Server.get("/github/api/checkstatus");
    return response.data;
  },
  fetchgithubacc: async (): Promise<returngithubacc> => {
    const response = await Server.get("/github/api/githubacc");
    return response.data;
  },
  fetchgithubmsg: async (cursor?: string, limit?: number): Promise<returngithubmsg> => {
    const response = await Server.get("/github/api/githubfetchmsg", {
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
    id: string,
    name: string,
    type: string,
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
    const response = await fetch(`${fetchurl}/github/api/githubagentmsg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        content,
        provider,
        model,
        id,
        name,
        type,
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
  githubdeleteservice: async (): Promise<returngithubfeedback> => {
    const response = await Server.post("/github/api/githubdeleteservice");
    return response.data;
  },
  githubdeletemessage: async (): Promise<returngithubfeedback> => {
    const response = await Server.post("/github/api/githubdeletemessage");
    return response.data;
  },
  githubcroncreate: async (data: githubcrondata): Promise<returngithubfeedback> => {
    const response = await Server.post("/github/api/githubcroncreate", { data });
    return response.data;
  },
  githubcronget: async (): Promise<returngithubcrondata> => {
    const response = await Server.get("/github/api/githubcronget");
    return response.data;
  },
};
