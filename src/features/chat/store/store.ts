import { chatauth } from "../api/api"
import type { chatfetch } from "../types"
import { toast } from "sonner"
import { create } from "zustand"

interface ChatClientState {
    Chat: chatfetch[];
    chatNextCursor: string | null;
    chatHasMore: boolean;
    chatLoadingMore: boolean;
    provider: string;
    model: string;
    reasoningLevel: "" | "low" | "medium" | "high";
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    setReasoningLevel: (level: "" | "low" | "medium" | "high") => void;
    resetchat: () => void;
    setChats: (chats: chatfetch[], nextCursor: string | null, hasMore: boolean) => void;
    fetchMoreChats: (cursor: string) => Promise<void>;
    sendmessage: (
        chatid: string,
        provider: string,
        model: string,
        content: string,
        type: string,
        images?: string[],
        onChunk?: (chunk: string, title?: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string; error: string }) => void,
        onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
        signal?: AbortSignal,
        reasoningLevel?: "" | "low" | "medium" | "high",
        onImage?: (url: string) => void,
    ) => Promise<void>;
    fetchmessage: (chatid: string, cursor?: number, limit?: number) => Promise<any>;
}

export const chatauthstore = create<ChatClientState>((set) => ({
    Chat: [],
    chatNextCursor: null,
    chatHasMore: false,
    chatLoadingMore: false,
    provider: "",
    model: "",
    reasoningLevel: "",

    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    setReasoningLevel: (level) => set({ reasoningLevel: level }),
    setChats: (Chat, chatNextCursor, chatHasMore) => set({ Chat, chatNextCursor, chatHasMore }),

    resetchat: () => set({ Chat: [], provider: "", model: "", reasoningLevel: "", chatNextCursor: null, chatHasMore: false, chatLoadingMore: false }),

    fetchMoreChats: async (cursor) => {
        set({ chatLoadingMore: true });
        try {
            const response = await chatauth.fetchchat(cursor);
            if (response.success && response.data) {
                const { messages, nextCursor, hasMore } = response.data;
                set((state) => ({
                    Chat: [...state.Chat, ...messages],
                    chatNextCursor: nextCursor,
                    chatHasMore: hasMore,
                }));
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const errorObj = err as any;
                toast.error(errorObj.response?.data?.message || err.message);
            }
        } finally {
            set({ chatLoadingMore: false });
        }
    },

    sendmessage: async (chatid, provider, model, content, type, images, onChunk, onStatus, onApproval, signal, reasoningLevel, onImage) => {
        try {
            await chatauth.sendmessage(
                chatid, provider, model, content, type, images, reasoningLevel,
                (chunk, title) => {
                    if (title) {
                        set((state) => ({
                            Chat: state.Chat.map(c => c.id === chatid ? { ...c, title } : c)
                        }));
                    }
                    if (onChunk) onChunk(chunk);
                },
                (status) => { if (onStatus) onStatus(status); },
                (approval) => { if (onApproval) onApproval(approval); },
                (url) => { if (onImage) onImage(url); },
                signal
            );
        } catch (err: unknown) {
            throw err;
        }
    },

    fetchmessage: async (chatid, cursor, limit) => {
        const response = await chatauth.fetchchatmessage(chatid, cursor, limit);
        return response;
    },
}))
