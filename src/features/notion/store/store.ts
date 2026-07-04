import { notionauth } from "../api/api";
import { create } from "zustand";

interface NotionClientState {
    provider: string;
    model: string;
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    resetnotion: () => void;
    sendmessage: (
        content: string,
        provider: string,
        model: string,
        id: string,
        name: string,
        type: string,
        images?: string[],
        onChunk?: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string; error: string }) => void,
        onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
        signal?: AbortSignal,
        reasoningLevel?: "" | "low" | "medium" | "high",
        onImage?: (url: string) => void,
    ) => Promise<void>;
}

export const notionauthstore = create<NotionClientState>((set) => ({
    provider: "",
    model: "",
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    resetnotion: () => set({ provider: "", model: "" }),
    sendmessage: async (content, provider, model, id, name, type, images, onChunk, onStatus, onApproval, signal, reasoningLevel, onImage) => {
        await notionauth.sendmessage(content, provider, model, id, name, type, images, onChunk!, onStatus, onApproval, onImage, signal, reasoningLevel);
    },
}))
