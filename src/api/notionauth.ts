import { Server } from "../config/axioconfig"
import { fetchurl } from "../config/fetchconfig";
import { returnnotionacc, returnnotionfeedback, returnnotionmsg } from "@/types/notiontype";

export const notionauth = {
    notionstate: async (): Promise<{ stateId: string }> => {
        const response = await Server.post("/notion/api/authurl");
        return response.data;
    },
    notioncheckstatus: async (): Promise<{ success: boolean }> => {
        const response = await Server.get("/notion/api/checkstatus");
        return response.data;
    },
    fetchnotionacc: async (): Promise<returnnotionacc> => {
        const response = await Server.get("/notion/api/notionacc");
        return response.data;
    },
    fetchnotionmsg: async (): Promise<returnnotionmsg> => {
        const response = await Server.get("/notion/api/notionfetchmsg");
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
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string; error : string }) => void
    ): Promise<void> => {
        const token = await (window as any).api.getToken();
        const response = await fetch(`${fetchurl}/notion/api/notionagentmsg`, {
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
    notiondeleteservice: async (): Promise<returnnotionfeedback> => {
        const response = await Server.post("/notion/api/notiondeleteservice")
        return response.data;
    },
    notiondeletemessage: async (): Promise<returnnotionfeedback> => {
        const response = await Server.post("/notion/api/notiondeletemessage")
        return response.data;
    }
}