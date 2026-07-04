import { Server } from "../../../shared/config/axioconfig"
import { fetchurl } from "../../../shared/config/fetchconfig";
import { authchatdata, authchatfeedback, authmessagedata } from "../types/type";

export const chatauth = {
    createchat: async (): Promise<authchatfeedback> => {
        const response = await Server.post("/chat/api/createchat")
        return response.data;
    },
    fetchchat: async (cursor?: string): Promise<authchatdata> => {
        const response = await Server.get("/chat/api/fetchchat", {
            params: {
                ...(cursor ? { cursor } : {})
            }
        })
        return response.data;
    },
    deletechat: async (
        chatid: string
    ): Promise<authchatfeedback> => {
        const response = await Server.post("/chat/api/deletechat", {
            chatid
        });
        return response.data;
    },
    uploadImage: async (file: File): Promise<string> => {
        const token = await (window as any).api.getToken();
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${fetchurl}/chat/api/upload-image`, {
            method: "POST",
            headers: {
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload image");
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Upload failed");
        return data.url;
    },
    sendmessage: async (
        chatid: string,
        provider: string,
        model: string,
        content: string,
        type: string,
        images?: string[],
        reasoningLevel?: "" | "low" | "medium" | "high",
        onChunk?: (chunk: string, title?: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string; error: string }) => void,
        onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
        onImage?: (url: string) => void,
        signal?: AbortSignal
    ): Promise<void> => {
        const token = await (window as any).api.getToken();

        const response = await fetch(`${fetchurl}/chat/api/chatmessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify({ chatid, provider, model, content, type, images, reasoningLevel: reasoningLevel || undefined }),
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
                        if (onChunk) onChunk(data.chunk, data.title);
                    }
                    else if (data.type === "status" || data.type === "chain") {
                        if (onStatus) onStatus(data);
                    } else if (data.type === "tool_approval_request") {
                        if (onApproval) onApproval(data);
                    } else if (data.type === "image") {
                        if (onImage) onImage(data.url);
                    }
                } catch {
                    // silently skip malformed lines
                }
            }
        }
    },
    fetchchatmessage: async (
        chatid: string,
        cursor?: number,
        limit?: number
    ): Promise<authmessagedata> => {
        const response = await Server.get("/chat/api/fetchchatmessage", {
            params: {
                chatid,
                ...(cursor !== undefined ? { cursor } : {}),
                ...(limit !== undefined ? { limit } : {})
            }
        })
        return response.data;
    }
}