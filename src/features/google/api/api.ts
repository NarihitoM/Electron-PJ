import { Server } from "../../../shared/config/axioconfig";
import { fetchurl } from "../../../shared/config/fetchconfig";
import {
  returngooglefeedback,
  returngooglefetchmessage,
  returnsheetcrondata,
  returndocscrondata,
  sheetcrondata,
  docscrondata,
} from "../types/type";

export const googleauth = {
  addservice: async (serviceemail: string, servicekey: string): Promise<returngooglefeedback> => {
    const response = await Server.post("/google/api/addservice", {
      serviceemail,
      servicekey,
    });
    return response.data;
  },
  addgooglesheeturl: async (sheeturl: string): Promise<returngooglefeedback> => {
    const response = await Server.post("/google/api/addgooglesheeturl", {
      sheeturl,
    });
    return response.data;
  },
  addgoogledocsurl: async (docsurl: string): Promise<returngooglefeedback> => {
    const response = await Server.post("/google/api/addgoogledocsurl", {
      docsurl,
    });
    return response.data;
  },
  fetchgoogleservice: async (): Promise<returngooglefeedback> => {
    const response = await Server.get("/google/api/fetchgoogleservices");
    return response.data;
  },
  fetchsheetmessage: async (cursor?: string, limit?: number): Promise<returngooglefetchmessage> => {
    const response = await Server.get("/google/api/fetchsheetmessage", {
      params: {
        ...(cursor !== undefined ? { cursor } : {}),
        ...(limit !== undefined ? { limit } : {}),
      },
    });
    return response.data;
  },
  fetchdocsmessage: async (cursor?: string, limit?: number): Promise<returngooglefetchmessage> => {
    const response = await Server.get("/google/api/fetchdocsmessage", {
      params: {
        ...(cursor !== undefined ? { cursor } : {}),
        ...(limit !== undefined ? { limit } : {}),
      },
    });
    return response.data;
  },
  deleteservice: async (): Promise<returngooglefeedback> => {
    const response = await Server.post("/google/api/servicedelete");
    return response.data;
  },
  deletesheetmsg: async (): Promise<returngooglefeedback> => {
    const response = await Server.post("/google/api/deletesheetmessage");
    return response.data;
  },
  deletedocsmsg: async (): Promise<returngooglefeedback> => {
    const response = await Server.post("/google/api/deletedocsmessage");
    return response.data;
  },
  sendsheetmessage: async (
    content: string,
    provider: string,
    model: string,
    url: string,
    type: string,
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
    const response = await fetch(`${fetchurl}/google/api/sendsheet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        provider,
        model,
        content,
        url,
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
  senddocsmessage: async (
    content: string,
    provider: string,
    model: string,
    url: string,
    type: string,
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
    const response = await fetch(`${fetchurl}/google/api/senddocs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        provider,
        model,
        content,
        url,
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
  sheetcroncreate: async (data: sheetcrondata): Promise<returngooglefeedback> => {
    const response = await Server.post("/google/api/sheetcroncreate", { data });
    return response.data;
  },
  sheetcronget: async (): Promise<returnsheetcrondata> => {
    const response = await Server.get("/google/api/sheetcronget");
    return response.data;
  },
  docscroncreate: async (data: docscrondata): Promise<returngooglefeedback> => {
    const response = await Server.post("/google/api/docscroncreate", { data });
    return response.data;
  },
  docscronget: async (): Promise<returndocscrondata> => {
    const response = await Server.get("/google/api/docscronget");
    return response.data;
  },
};
