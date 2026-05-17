import { Server } from "../config/axioconfig"
import { fetchurl } from "../config/fetchconfig";
import { returnslackacc, returnslackfeedback, returnslackmsg } from "@/types/slacktype";

export const slackauth = {
    slackstate: async (): Promise<{ stateId: string }> => {
        const response = await Server.post("/slack/api/authurl");
        return response.data;
    },
    slackcheckstatus: async (): Promise<{ success: boolean }> => {
        const response = await Server.get("/slack/api/checkstatus");
        return response.data;
    },
    slackacc: async (): Promise<returnslackacc> => {
        const response = await Server.get("/slack/api/slackacc");
        return response.data;
    },
    fetchslackmessage: async (): Promise<returnslackmsg> => {
        const response = await Server.get("/slack/api/fetchmessage");
        return response.data;
    },
    deleteslackservice : async () : Promise<returnslackfeedback> => {
        const response = await Server.post("/slack/api/deleteservice");
        return response.data;
    },
    deleteslackmsg : async () : Promise<returnslackfeedback> => {
        const response = await Server.post("/slack/api/deletemessage");
        return response.data;
    },
    sendmessage: async (
        content: string,
        provider: string,
        model: string,
        id: string,
        name: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string ; error : string }) => void
    ): Promise<void> => {
        const token = await (window as any).api.getToken();
        const response = await fetch(`${fetchurl}/slack/api/sendmessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify({ content, provider, model, id, name, type }),
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
}