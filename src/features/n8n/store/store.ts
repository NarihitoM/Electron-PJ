import { n8nauth } from "../api/api";
import { create } from "zustand";

interface N8nClientState {
    provider: string;
    model: string;
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    resetn8n: () => void;
    sendmessage: (
        content: string,
        provider: string,
        model: string,
        n8nUrl: string,
        authType: string,
        authValue: string | undefined,
        images?: string[],
        onChunk?: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string; error: string }) => void,
        onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
        signal?: AbortSignal,
        reasoningLevel?: "" | "low" | "medium" | "high",
        onImage?: (url: string) => void
    ) => Promise<void>;
}

export const n8nauthstore = create<N8nClientState>((set) => ({
    provider: "",
    model: "",
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    resetn8n: () => set({ provider: "", model: "" }),
    sendmessage: async (content, provider, model, n8nUrl, authType, authValue, images, onChunk, onStatus, onApproval, signal, reasoningLevel, onImage) => {
        await n8nauth.sendmessage(content, provider, model, n8nUrl, authType, authValue, images, onChunk, onStatus, onApproval, onImage, signal, reasoningLevel);
    },
}))
