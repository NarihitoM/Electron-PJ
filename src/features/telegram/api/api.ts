import { Server } from "../../../shared/config/axioconfig"
import { fetchurl } from "../../../shared/config/fetchconfig";
import { returntelegramcrondata, returntelegramfeedback, returntelegrammessage, telegramcrondata } from "../types/type";

export const telegramauth = {
    sendmessage: async (
        content: string,
        provider: string,
        model: string,
        id: string,
        type: string,
        images: string[] | undefined,
        onChunk: (chunk: string) => void,
        onThinking?: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string; error : string }) => void,
        onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
        onImage?: (url: string) => void,
        signal?: AbortSignal,
        reasoningLevel?: "" | "low" | "medium" | "high"
    ): Promise<void> => {
        const token = await (window as any).api.getToken();
        const response = await fetch(`${fetchurl}/telegram/api/sendmessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify({ content, provider, model, id, type, images, reasoningLevel: reasoningLevel || undefined }),
            signal,
        });

        if (!response.ok) throw new Error("Failed to connect to stream");
        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
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
                    }
                    else if (data.type === "thinking") {
                        if (onThinking) onThinking(data.chunk);
                    }
                    else if (data.type === "status" || data.type === "chain") {
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
    telegrammsgreset: async () : Promise<returntelegramfeedback> => {
        const response = await Server.post("/telegram/api/telegrammsgreset")
        return response.data;
    },
    telegramresetservice : async () : Promise<returntelegramfeedback> => {
        const response = await Server.post("/telegram/api/telegramdeletservice");
        return response.data;
    },
    telegramservicecreate: async (
        phone: string,
        password: string
    ): Promise<returntelegramfeedback> => {
        const response = await Server.post("/telegram/api/telegramcreate", {
            phone,
            password
        })
        return response.data;
    },
    telegramverify: async (
        phonecode: string,
    ): Promise<returntelegramfeedback> => {
        const response = await Server.post("/telegram/api/telegramverify", {
            phonecode,
        });
        return response.data;
    },
    fetchtelegramaccount: async (): Promise<returntelegramfeedback> => {
        const response = await Server.get("/telegram/api/telegramfetch");
        return response.data;
    },
    fetchtelegrammessage: async (cursor?: string, limit?: number): Promise<returntelegrammessage> => {
        const response = await Server.get("/telegram/api/telegrammsghistory", {
            params: {
                ...(cursor !== undefined ? { cursor } : {}),
                ...(limit !== undefined ? { limit } : {})
            }
        });
        return response.data;
    },
    telegramcroncreate: async (
        data : telegramcrondata
    ) : Promise<returntelegramfeedback> => {
        const response = await Server.post("/telegram/api/telegramcroncreate", {
            data
        });
        return response.data;
    },
    telegramcronget: async () : Promise<returntelegramcrondata> => {
        const response = await Server.get("/telegram/api/telegramcronget");
        return response.data;
    },
}