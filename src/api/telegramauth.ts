import { Server } from "../config/axioconfig"
import { fetchurl } from "../config/fetchconfig";
import { returntelegramfeedback, returntelegrammessage } from "@/types/telegramtype";

export const telegramauth = {
    sendmessage: async (
        content: string,
        provider: string,
        model: string,
        id: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string; error : string }) => void
    ): Promise<void> => {
        const token = await (window as any).api.getToken();
        const response = await fetch(`${fetchurl}/telegram/api/sendmessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify({ content, provider, model, id, type }),
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
                    else if (data.type === "status") {
                        if (onStatus) onStatus(data);
                    }
                } catch (e) {
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
    fetchtelegrammessage: async (): Promise<returntelegrammessage> => {
        const response = await Server.get("/telegram/api/telegrammsghistory");
        return response.data;
    }
}