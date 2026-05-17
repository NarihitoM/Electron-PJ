import { Server } from "../config/axioconfig"
import { fetchurl } from "../config/fetchconfig";
import { returnwebdata, returnwebfeedback } from "@/types/webscraptype";

export const webscrapauth = {
    sendmessage: async (
        provider: string,
        model: string,
        content: string,
        onChunk: (chunk: string) => void
    ): Promise<void> => {
    const token = await (window as any).api.getToken();

        const response = await fetch(`${fetchurl}/webscrape/api/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify({ provider, model, content }),
        });

        if (!response.ok) {
            let errormessage = `Failed to connect to stream (${response.status})`;
            const errortext = await response.text();

            if (errortext.trim()) {
                try {
                    const errorbody = JSON.parse(errortext);
                    errormessage = errorbody?.message ?? errormessage;
                }
                catch {
                    errormessage = errortext;
                }
            }

            throw new Error(errormessage);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (reader) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const data = line.replace("data: ", "").trim();

                    if (data === "[DONE]") {
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);

                        if (parsed.error) {
                            throw new Error(parsed.error);
                        }

                        if (parsed.chunk) {
                            onChunk(parsed.chunk);
                        }
                    }
                    catch (err: unknown) {
                        if (err instanceof Error) {
                            throw err;
                        }
                    }
                }
            }
        }
    },
    fetchweb : async (
    ) : Promise<returnwebdata> => {
        const response = await Server.get("/webscrape/api/fetchwebscrapmessage")
        return response.data;
    },
    deleteweb : async (
    ) : Promise<returnwebfeedback> => {
         const response = await Server.post("/webscrape/api/deletewebscrapmessage")
        return response.data;
    }
};
