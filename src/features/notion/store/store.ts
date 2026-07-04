import { create } from "zustand"
import type { chatsession } from "@/shared/types/globaltype"
import type { ModelEntry } from "@/shared/lib/modelsapi"

interface NotionClientState {
    provider: string
    model: string
    sessionmessage: chatsession[]
    input: string
    sending: boolean
    loadingfetch: boolean
    loadingerror: boolean
    loadingnotionmsg: boolean
    nextCursor: string | null
    hasMore: boolean
    loadingMore: boolean
    type: string | null
    pageid: string | null
    isChecking: boolean
    pendingApproval: { name: string; query: Record<string, unknown> | null } | null
    pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null }
    threadIdRef: { current: string | null }
    lightboxImages: string[]
    lightboxIndex: number
    lightboxOpen: boolean
    copiedIndex: number | null
    uploadingImages: boolean
    uploadingImageUrls: Set<string>
    pendingImages: File[]
    modelList: ModelEntry[]
    modelsLoading: boolean
    reasoningLevel: "" | "low" | "medium" | "high"

    setProvider: (v: string) => void
    setModel: (v: string) => void
    setsessionmessage: (v: chatsession[]) => void
    setInput: (v: string) => void
    setSending: (v: boolean) => void
    setloadingfetch: (v: boolean) => void
    setloadingerror: (v: boolean) => void
    setloadingnotionmsg: (v: boolean) => void
    setNextCursor: (v: string | null) => void
    setHasMore: (v: boolean) => void
    setLoadingMore: (v: boolean) => void
    settype: (v: string | null) => void
    setpageid: (v: string | null) => void
    setIsChecking: (v: boolean) => void
    setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void
    setLightboxImages: (v: string[]) => void
    setLightboxIndex: (v: number) => void
    setLightboxOpen: (v: boolean) => void
    setCopiedIndex: (v: number | null) => void
    setUploadingImages: (v: boolean) => void
    setUploadingImageUrls: (v: Set<string>) => void
    setPendingImages: (v: File[]) => void
    setModelList: (v: ModelEntry[]) => void
    setModelsLoading: (v: boolean) => void
    setReasoningLevel: (v: "" | "low" | "medium" | "high") => void

    resetnotion: () => void
    updateSessionMessages: (updater: (prev: chatsession[]) => chatsession[]) => void
}

export const notionauthstore = create<NotionClientState>((set) => ({
    provider: "",
    model: "",
    sessionmessage: [],
    input: "",
    sending: false,
    loadingfetch: false,
    loadingerror: false,
    loadingnotionmsg: false,
    nextCursor: null,
    hasMore: false,
    loadingMore: false,
    type: "text",
    pageid: null,
    isChecking: false,
    pendingApproval: null,
    pendingApprovalRef: { current: null },
    threadIdRef: { current: null },
    lightboxImages: [],
    lightboxIndex: 0,
    lightboxOpen: false,
    copiedIndex: null,
    uploadingImages: false,
    uploadingImageUrls: new Set(),
    pendingImages: [],
    modelList: [],
    modelsLoading: false,
    reasoningLevel: "",

    setProvider: (v) => set({ provider: v, model: "" }),
    setModel: (v) => set({ model: v }),
    setsessionmessage: (v) => set({ sessionmessage: v }),
    setInput: (v) => set({ input: v }),
    setSending: (v) => set({ sending: v }),
    setloadingfetch: (v) => set({ loadingfetch: v }),
    setloadingerror: (v) => set({ loadingerror: v }),
    setloadingnotionmsg: (v) => set({ loadingnotionmsg: v }),
    setNextCursor: (v) => set({ nextCursor: v }),
    setHasMore: (v) => set({ hasMore: v }),
    setLoadingMore: (v) => set({ loadingMore: v }),
    settype: (v) => set({ type: v }),
    setpageid: (v) => set({ pageid: v }),
    setIsChecking: (v) => set({ isChecking: v }),
    setPendingApproval: (v) => set({ pendingApproval: v }),
    setLightboxImages: (v) => set({ lightboxImages: v }),
    setLightboxIndex: (v) => set({ lightboxIndex: v }),
    setLightboxOpen: (v) => set({ lightboxOpen: v }),
    setCopiedIndex: (v) => set({ copiedIndex: v }),
    setUploadingImages: (v) => set({ uploadingImages: v }),
    setUploadingImageUrls: (v) => set({ uploadingImageUrls: v }),
    setPendingImages: (v) => set({ pendingImages: v }),
    setModelList: (v) => set({ modelList: v }),
    setModelsLoading: (v) => set({ modelsLoading: v }),
    setReasoningLevel: (v) => set({ reasoningLevel: v }),

    resetnotion: () => set({ provider: "", model: "" }),
    updateSessionMessages: (updater) => set((state) => ({ sessionmessage: updater(state.sessionmessage) })),
}))
