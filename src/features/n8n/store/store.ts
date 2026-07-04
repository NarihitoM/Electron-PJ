import { create } from "zustand"
import type { chatsession } from "@/shared/types/globaltype"

interface N8nClientState {
    provider: string;
    model: string;
    sessionmessage: chatsession[];
    input: string;
    sending: boolean;
    reasoningLevel: "" | "low" | "medium" | "high";
    pendingImages: File[];
    uploadingImages: boolean;
    uploadingImageUrls: Set<string>;

    loadingfetch: boolean;
    loadingerror: boolean;
    nextCursor: string | null;
    hasMore: boolean;
    loadingMore: boolean;
    type: string | null;
    hover: boolean;

    settingsOpen: boolean;
    urlInput: string;
    authTypeInput: string;
    authValueInput: string;
    testingMode: boolean;
    testResult: { restApiAvailable: boolean; mode: string } | null;

    lightboxImages: string[];
    lightboxIndex: number;
    lightboxOpen: boolean;
    copiedIndex: number | null;

    pendingApproval: { name: string; query: Record<string, unknown> | null } | null;

    abortControllerRef: { current: AbortController | null };
    lastSentInputRef: { current: string };
    messagesEndRef: { current: HTMLDivElement | null };
    pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
    threadIdRef: { current: string | null };
    topSentinelRef: { current: HTMLDivElement | null };
    scrollContainerRef: { current: HTMLDivElement | null };

    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    setsessionmessage: (messages: chatsession[]) => void;
    setInput: (input: string) => void;
    setSending: (v: boolean) => void;
    setReasoningLevel: (level: "" | "low" | "medium" | "high") => void;
    setPendingImages: (images: File[]) => void;
    setUploadingImages: (v: boolean) => void;
    setUploadingImageUrls: (v: Set<string>) => void;
    setloadingfetch: (v: boolean) => void;
    setloadingerror: (v: boolean) => void;
    setNextCursor: (v: string | null) => void;
    setHasMore: (v: boolean) => void;
    setLoadingMore: (v: boolean) => void;
    settype: (v: string | null) => void;
    setHover: (v: boolean) => void;
    setSettingsOpen: (v: boolean) => void;
    setUrlInput: (v: string) => void;
    setAuthTypeInput: (v: string) => void;
    setAuthValueInput: (v: string) => void;
    setTestingMode: (v: boolean) => void;
    setTestResult: (v: { restApiAvailable: boolean; mode: string } | null) => void;
    setLightboxImages: (v: string[]) => void;
    setLightboxIndex: (v: number) => void;
    setLightboxOpen: (v: boolean) => void;
    setCopiedIndex: (v: number | null) => void;
    setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;

    resetSending: () => void;
    scrollToBottom: () => void;
    updateSessionMessages: (updater: (prev: chatsession[]) => chatsession[]) => void;
}

export const n8nauthstore = create<N8nClientState>((set, get) => ({
    provider: "",
    model: "",
    sessionmessage: [],
    input: "",
    sending: false,
    reasoningLevel: "",
    pendingImages: [],
    uploadingImages: false,
    uploadingImageUrls: new Set(),

    loadingfetch: false,
    loadingerror: false,
    nextCursor: null,
    hasMore: false,
    loadingMore: false,
    type: "text",
    hover: false,

    settingsOpen: false,
    urlInput: "",
    authTypeInput: "cookie",
    authValueInput: "",
    testingMode: false,
    testResult: null,

    lightboxImages: [],
    lightboxIndex: 0,
    lightboxOpen: false,
    copiedIndex: null,

    pendingApproval: null,

    abortControllerRef: { current: null },
    lastSentInputRef: { current: "" },
    messagesEndRef: { current: null },
    pendingApprovalRef: { current: null },
    threadIdRef: { current: null },
    topSentinelRef: { current: null },
    scrollContainerRef: { current: null },

    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    setsessionmessage: (messages) => set({ sessionmessage: messages }),
    setInput: (input) => set({ input }),
    setSending: (v) => set({ sending: v }),
    setReasoningLevel: (reasoningLevel) => set({ reasoningLevel }),
    setPendingImages: (pendingImages) => set({ pendingImages }),
    setUploadingImages: (v) => set({ uploadingImages: v }),
    setUploadingImageUrls: (v) => set({ uploadingImageUrls: v }),
    setloadingfetch: (v) => set({ loadingfetch: v }),
    setloadingerror: (v) => set({ loadingerror: v }),
    setNextCursor: (v) => set({ nextCursor: v }),
    setHasMore: (v) => set({ hasMore: v }),
    setLoadingMore: (v) => set({ loadingMore: v }),
    settype: (v) => set({ type: v }),
    setHover: (v) => set({ hover: v }),
    setSettingsOpen: (v) => set({ settingsOpen: v }),
    setUrlInput: (v) => set({ urlInput: v }),
    setAuthTypeInput: (v) => set({ authTypeInput: v }),
    setAuthValueInput: (v) => set({ authValueInput: v }),
    setTestingMode: (v) => set({ testingMode: v }),
    setTestResult: (v) => set({ testResult: v }),
    setLightboxImages: (v) => set({ lightboxImages: v }),
    setLightboxIndex: (v) => set({ lightboxIndex: v }),
    setLightboxOpen: (v) => set({ lightboxOpen: v }),
    setCopiedIndex: (v) => set({ copiedIndex: v }),
    setPendingApproval: (v) => set({ pendingApproval: v }),

    resetSending: () => set({ sending: false }),
    scrollToBottom: () => {
        const el = get().messagesEndRef.current;
        el?.scrollIntoView({ behavior: "auto" });
    },
    updateSessionMessages: (updater) => set((state) => ({ sessionmessage: updater(state.sessionmessage) })),
}))
