import { Server } from "../config/axioconfig"
import { fetchurl } from "../config/fetchconfig";
import { authchatdata, authchatfeedback, authmessagedata } from "@/types/chatype";

export const chatauth = {
    createchat: async (): Promise<authchatfeedback> => {
        const response = await Server.post("/chat/api/createchat")
        return response.data;
    },
    fetchchat: async (): Promise<authchatdata> => {
        const response = await Server.get("/chat/api/fetchchat")
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
    sendmessage: async (
        chatid: string,
        provider: string,
        model: string,
        content: string,
        type: string,
        onChunk: (chunk: string, title?: string) => void
    ): Promise<void> => {
    const token = await (window as any).api.getToken();

        const response = await fetch(`${fetchurl}/chat/api/chatmessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify({ chatid, provider, model, content, type }),
        });

        if (!response.ok) throw new Error("Failed to connect to stream");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const data = line.replace("data: ", "").trim();
                    if (data === "[DONE]") return;

                    try {
                        const parsed = JSON.parse(data);
                        onChunk(parsed.chunk, parsed.title);
                    } catch (err: unknown) {
                        console.warn("Error with some chunks data.")
                    }
                }
            }
        }
    },
    fetchchatmessage: async (
        chatid: string
    ): Promise<authmessagedata> => {
        const response = await Server.get("/chat/api/fetchchatmessage", {
            params: {
                chatid
            }
        })
        return response.data;
    }
}