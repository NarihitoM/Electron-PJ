import { create } from "zustand"
import type { chatsession } from "@/shared/types/globaltype"
import type { chatfetch } from "../types"

interface ChatClientState {
    Chat: chatfetch[];
    chatNextCursor: string | null;
    chatHasMore: boolean;
    chatLoadingMore: boolean;

    provider: string;
    model: string;
    reasoningLevel: "" | "low" | "medium" | "high";
    sessionmessage: chatsession[];
    input: string;
    sending: boolean;
    loadingfetch: boolean;
    loadingerror: boolean;
    nextCursor: number | null;
    hasMore: boolean;
    loadingMore: boolean;
    type: string | null;

    pendingApproval: { name: string; query: Record<string, unknown> | null } | null;
    lightboxImages: string[];
    lightboxIndex: number;
    lightboxOpen: boolean;
    copiedIndex: number | null;
    uploadingImages: boolean;
    uploadingImageUrls: Set<string>;
    pendingImages: File[];
    recordstatus: boolean;
    loadingrecord: boolean;

    pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
    threadIdRef: { current: string | null };

    setChats: (Chat: chatfetch[], chatNextCursor: string | null, chatHasMore: boolean) => void;
    setChatNextCursor: (v: string | null) => void;
    setChatHasMore: (v: boolean) => void;
    setChatLoadingMore: (v: boolean) => void;
    resetchat: () => void;
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    setReasoningLevel: (level: "" | "low" | "medium" | "high") => void;
    setsessionmessage: (messages: chatsession[]) => void;
    setInput: (input: string) => void;
    setSending: (v: boolean) => void;
    setloadingfetch: (v: boolean) => void;
    setloadingerror: (v: boolean) => void;
    setNextCursor: (v: number | null) => void;
    setHasMore: (v: boolean) => void;
    setLoadingMore: (v: boolean) => void;
    settype: (v: string | null) => void;
    setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;
    setLightboxImages: (v: string[]) => void;
    setLightboxIndex: (v: number) => void;
    setLightboxOpen: (v: boolean) => void;
    setCopiedIndex: (v: number | null) => void;
    setUploadingImages: (v: boolean) => void;
    setUploadingImageUrls: (v: Set<string>) => void;
    setPendingImages: (images: File[]) => void;
    setrecordstatus: (v: boolean) => void;
    setloadingrecord: (v: boolean) => void;

    updateSessionMessages: (updater: (prev: chatsession[]) => chatsession[]) => void;
}

export const chatauthstore = create<ChatClientState>((set) => ({
    Chat: [],
    chatNextCursor: null,
    chatHasMore: false,
    chatLoadingMore: false,
    provider: "",
    model: "",
    reasoningLevel: "",
    sessionmessage: [],
    input: "",
    sending: false,
    loadingfetch: false,
    loadingerror: false,
    nextCursor: null,
    hasMore: false,
    loadingMore: false,
    type: "text",
    pendingApproval: null,
    lightboxImages: [],
    lightboxIndex: 0,
    lightboxOpen: false,
    copiedIndex: null,
    uploadingImages: false,
    uploadingImageUrls: new Set(),
    pendingImages: [],
    recordstatus: false,
    loadingrecord: false,

    pendingApprovalRef: { current: null },
    threadIdRef: { current: null },

    setChats: (Chat, chatNextCursor, chatHasMore) => set({ Chat, chatNextCursor, chatHasMore }),
    setChatNextCursor: (v) => set({ chatNextCursor: v }),
    setChatHasMore: (v) => set({ chatHasMore: v }),
    setChatLoadingMore: (v) => set({ chatLoadingMore: v }),
    resetchat: () => set({ Chat: [], provider: "", model: "", reasoningLevel: "", chatNextCursor: null, chatHasMore: false, chatLoadingMore: false }),
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    setReasoningLevel: (reasoningLevel) => set({ reasoningLevel }),
    setsessionmessage: (messages) => set({ sessionmessage: messages }),
    setInput: (input) => set({ input }),
    setSending: (v) => set({ sending: v }),
    setloadingfetch: (v) => set({ loadingfetch: v }),
    setloadingerror: (v) => set({ loadingerror: v }),
    setNextCursor: (v) => set({ nextCursor: v }),
    setHasMore: (v) => set({ hasMore: v }),
    setLoadingMore: (v) => set({ loadingMore: v }),
    settype: (v) => set({ type: v }),
    setPendingApproval: (v) => set({ pendingApproval: v }),
    setLightboxImages: (v) => set({ lightboxImages: v }),
    setLightboxIndex: (v) => set({ lightboxIndex: v }),
    setLightboxOpen: (v) => set({ lightboxOpen: v }),
    setCopiedIndex: (v) => set({ copiedIndex: v }),
    setUploadingImages: (v) => set({ uploadingImages: v }),
    setUploadingImageUrls: (v) => set({ uploadingImageUrls: v }),
    setPendingImages: (images) => set({ pendingImages: images }),
    setrecordstatus: (v) => set({ recordstatus: v }),
    setloadingrecord: (v) => set({ loadingrecord: v }),

    updateSessionMessages: (updater) => set((state) => ({ sessionmessage: updater(state.sessionmessage) })),
}))
