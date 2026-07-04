import { create } from "zustand"
import type { chatsession } from "@/shared/types/globaltype"
import type { ModelEntry } from "@/shared/lib/modelsapi"

interface GoogleClientState {
    provider: string;
    model: string;
    sheeturl: string;
    docsurl: string;

    // Docs fields
    sessionmessage_docs: chatsession[];
    input_docs: string;
    sending_docs: boolean;
    loadingfetch_docs: boolean;
    loadingerror_docs: boolean;
    nextCursor_docs: string | null;
    hasMore_docs: boolean;
    loadingMore_docs: boolean;
    type_docs: string | null;
    opendocs: boolean;
    openservice: boolean;
    useremail_docs: string;
    key_docs: string;
    docsinput: string;
    lightboxImages_docs: string[];
    lightboxIndex_docs: number;
    lightboxOpen_docs: boolean;
    copiedIndex_docs: number | null;
    uploadingImages_docs: boolean;
    uploadingImageUrls_docs: Set<string>;
    pendingImages_docs: File[];
    modelList_docs: { model: string; name: string }[];
    modelsLoading_docs: boolean;
    reasoningLevel_docs: "" | "low" | "medium" | "high";
    recordstatus_docs: boolean;
    loadingrecord_docs: boolean;
    pendingApproval: { name: string; query: Record<string, unknown> | null } | null;
    pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
    threadIdRef: { current: string | null };
    setsessionmessage_docs: (messages: chatsession[]) => void;
    setInput_docs: (input: string) => void;
    setSending_docs: (v: boolean) => void;
    setloadingfetch_docs: (v: boolean) => void;
    setloadingerror_docs: (v: boolean) => void;
    setNextCursor_docs: (v: string | null) => void;
    setHasMore_docs: (v: boolean) => void;
    setLoadingMore_docs: (v: boolean) => void;
    settype_docs: (v: string | null) => void;
    setOpendocs: (v: boolean) => void;
    setOpenservice: (v: boolean) => void;
    setUseremail_docs: (v: string) => void;
    setKey_docs: (v: string) => void;
    setDocsinput: (v: string) => void;
    setLightboxImages_docs: (v: string[]) => void;
    setLightboxIndex_docs: (v: number) => void;
    setLightboxOpen_docs: (v: boolean) => void;
    setCopiedIndex_docs: (v: number | null) => void;
    setUploadingImages_docs: (v: boolean) => void;
    setUploadingImageUrls_docs: (v: Set<string>) => void;
    setPendingImages_docs: (v: File[]) => void;
    setModelList_docs: (v: { model: string; name: string }[]) => void;
    setModelsLoading_docs: (v: boolean) => void;
    setReasoningLevel_docs: (level: "" | "low" | "medium" | "high") => void;
    setRecordstatus_docs: (v: boolean) => void;
    setLoadingrecord_docs: (v: boolean) => void;
    setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;
    updateSessionMessages_docs: (updater: (prev: chatsession[]) => chatsession[]) => void;

    // Sheet fields
    sessionmessage_sheet: chatsession[];
    input_sheet: string;
    sending_sheet: boolean;
    loadingfetch_sheet: boolean;
    loadingerror_sheet: boolean;
    nextCursor_sheet: string | null;
    hasMore_sheet: boolean;
    loadingMore_sheet: boolean;
    type_sheet: string | null;
    hover_sheet: boolean;
    opensheet: boolean;
    useremail_sheet: string;
    key_sheet: string;
    sheetinput: string;
    pendingApproval_sheet: { name: string; query: Record<string, unknown> | null } | null;
    pendingApprovalRef_sheet: { current: { name: string; query: Record<string, unknown> | null } | null };
    threadIdRef_sheet: { current: string | null };
    lightboxImages_sheet: string[];
    lightboxIndex_sheet: number;
    lightboxOpen_sheet: boolean;
    copiedIndex_sheet: number | null;
    uploadingImages_sheet: boolean;
    uploadingImageUrls_sheet: Set<string>;
    pendingImages_sheet: File[];
    modelList_sheet: ModelEntry[];
    modelsLoading_sheet: boolean;
    reasoningLevel_sheet: "" | "low" | "medium" | "high";
    recordstatus_sheet: boolean;
    loadingrecord_sheet: boolean;

    setsheeturl: (url: string) => void;
    setdocsurl: (url: string) => void;
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    resetgoogle: () => void;

    setsessionmessage_sheet: (messages: chatsession[]) => void;
    setInput_sheet: (input: string) => void;
    setSending_sheet: (v: boolean) => void;
    setloadingfetch_sheet: (v: boolean) => void;
    setloadingerror_sheet: (v: boolean) => void;
    setNextCursor_sheet: (v: string | null) => void;
    setHasMore_sheet: (v: boolean) => void;
    setLoadingMore_sheet: (v: boolean) => void;
    settype_sheet: (v: string | null) => void;
    setHover_sheet: (v: boolean) => void;
    setOpensheet: (v: boolean) => void;
    setuseremail_sheet: (v: string) => void;
    setkey_sheet: (v: string) => void;
    setsheetinput: (v: string) => void;
    setPendingApproval_sheet: (v: { name: string; query: Record<string, unknown> | null } | null) => void;
    setLightboxImages_sheet: (v: string[]) => void;
    setLightboxIndex_sheet: (v: number) => void;
    setLightboxOpen_sheet: (v: boolean) => void;
    setCopiedIndex_sheet: (v: number | null) => void;
    setUploadingImages_sheet: (v: boolean) => void;
    setUploadingImageUrls_sheet: (v: Set<string>) => void;
    setPendingImages_sheet: (v: File[]) => void;
    setModelList_sheet: (v: ModelEntry[]) => void;
    setModelsLoading_sheet: (v: boolean) => void;
    setReasoningLevel_sheet: (level: "" | "low" | "medium" | "high") => void;
    setrecordstatus_sheet: (v: boolean) => void;
    setloadingrecord_sheet: (v: boolean) => void;
    updateSessionMessages_sheet: (updater: (prev: chatsession[]) => chatsession[]) => void;
}

export const googleauthstore = create<GoogleClientState>((set) => ({
    provider: "",
    model: "",
    sheeturl: "",
    docsurl: "",

    // Docs initial
    sessionmessage_docs: [],
    input_docs: "",
    sending_docs: false,
    loadingfetch_docs: false,
    loadingerror_docs: false,
    nextCursor_docs: null,
    hasMore_docs: false,
    loadingMore_docs: false,
    type_docs: "text",
    opendocs: false,
    openservice: false,
    useremail_docs: "",
    key_docs: "",
    docsinput: "",
    lightboxImages_docs: [],
    lightboxIndex_docs: 0,
    lightboxOpen_docs: false,
    copiedIndex_docs: null,
    uploadingImages_docs: false,
    uploadingImageUrls_docs: new Set(),
    pendingImages_docs: [],
    modelList_docs: [],
    modelsLoading_docs: false,
    reasoningLevel_docs: "",
    recordstatus_docs: false,
    loadingrecord_docs: false,
    pendingApproval: null,
    pendingApprovalRef: { current: null },
    threadIdRef: { current: null },

    // Sheet initial
    sessionmessage_sheet: [],
    input_sheet: "",
    sending_sheet: false,
    loadingfetch_sheet: false,
    loadingerror_sheet: false,
    nextCursor_sheet: null,
    hasMore_sheet: false,
    loadingMore_sheet: false,
    type_sheet: "text",
    hover_sheet: false,
    opensheet: false,
    useremail_sheet: "",
    key_sheet: "",
    sheetinput: "",
    pendingApproval_sheet: null,
    pendingApprovalRef_sheet: { current: null },
    threadIdRef_sheet: { current: null },
    lightboxImages_sheet: [],
    lightboxIndex_sheet: 0,
    lightboxOpen_sheet: false,
    copiedIndex_sheet: null,
    uploadingImages_sheet: false,
    uploadingImageUrls_sheet: new Set(),
    pendingImages_sheet: [],
    modelList_sheet: [],
    modelsLoading_sheet: false,
    reasoningLevel_sheet: "",
    recordstatus_sheet: false,
    loadingrecord_sheet: false,

    // Shared setters
    setsheeturl: (sheeturl) => set({ sheeturl }),
    setdocsurl: (docsurl) => set({ docsurl }),
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    resetgoogle: () => set({ provider: "", model: "", sheeturl: "", docsurl: "" }),

    // Docs setters
    setsessionmessage_docs: (v) => set({ sessionmessage_docs: v }),
    setInput_docs: (v) => set({ input_docs: v }),
    setSending_docs: (v) => set({ sending_docs: v }),
    setloadingfetch_docs: (v) => set({ loadingfetch_docs: v }),
    setloadingerror_docs: (v) => set({ loadingerror_docs: v }),
    setNextCursor_docs: (v) => set({ nextCursor_docs: v }),
    setHasMore_docs: (v) => set({ hasMore_docs: v }),
    setLoadingMore_docs: (v) => set({ loadingMore_docs: v }),
    settype_docs: (v) => set({ type_docs: v }),
    setOpendocs: (v) => set({ opendocs: v }),
    setOpenservice: (v) => set({ openservice: v }),
    setUseremail_docs: (v) => set({ useremail_docs: v }),
    setKey_docs: (v) => set({ key_docs: v }),
    setDocsinput: (v) => set({ docsinput: v }),
    setLightboxImages_docs: (v) => set({ lightboxImages_docs: v }),
    setLightboxIndex_docs: (v) => set({ lightboxIndex_docs: v }),
    setLightboxOpen_docs: (v) => set({ lightboxOpen_docs: v }),
    setCopiedIndex_docs: (v) => set({ copiedIndex_docs: v }),
    setUploadingImages_docs: (v) => set({ uploadingImages_docs: v }),
    setUploadingImageUrls_docs: (v) => set({ uploadingImageUrls_docs: v }),
    setPendingImages_docs: (v) => set({ pendingImages_docs: v }),
    setModelList_docs: (v) => set({ modelList_docs: v }),
    setModelsLoading_docs: (v) => set({ modelsLoading_docs: v }),
    setReasoningLevel_docs: (v) => set({ reasoningLevel_docs: v }),
    setRecordstatus_docs: (v) => set({ recordstatus_docs: v }),
    setLoadingrecord_docs: (v) => set({ loadingrecord_docs: v }),
    setPendingApproval: (v) => set({ pendingApproval: v }),
    updateSessionMessages_docs: (updater) => set((state) => ({ sessionmessage_docs: updater(state.sessionmessage_docs) })),

    // Sheet setters
    setsessionmessage_sheet: (v) => set({ sessionmessage_sheet: v }),
    setInput_sheet: (v) => set({ input_sheet: v }),
    setSending_sheet: (v) => set({ sending_sheet: v }),
    setloadingfetch_sheet: (v) => set({ loadingfetch_sheet: v }),
    setloadingerror_sheet: (v) => set({ loadingerror_sheet: v }),
    setNextCursor_sheet: (v) => set({ nextCursor_sheet: v }),
    setHasMore_sheet: (v) => set({ hasMore_sheet: v }),
    setLoadingMore_sheet: (v) => set({ loadingMore_sheet: v }),
    settype_sheet: (v) => set({ type_sheet: v }),
    setHover_sheet: (v) => set({ hover_sheet: v }),
    setOpensheet: (v) => set({ opensheet: v }),
    setuseremail_sheet: (v) => set({ useremail_sheet: v }),
    setkey_sheet: (v) => set({ key_sheet: v }),
    setsheetinput: (v) => set({ sheetinput: v }),
    setPendingApproval_sheet: (v) => set({ pendingApproval_sheet: v }),
    setLightboxImages_sheet: (v) => set({ lightboxImages_sheet: v }),
    setLightboxIndex_sheet: (v) => set({ lightboxIndex_sheet: v }),
    setLightboxOpen_sheet: (v) => set({ lightboxOpen_sheet: v }),
    setCopiedIndex_sheet: (v) => set({ copiedIndex_sheet: v }),
    setUploadingImages_sheet: (v) => set({ uploadingImages_sheet: v }),
    setUploadingImageUrls_sheet: (v) => set({ uploadingImageUrls_sheet: v }),
    setPendingImages_sheet: (v) => set({ pendingImages_sheet: v }),
    setModelList_sheet: (v) => set({ modelList_sheet: v }),
    setModelsLoading_sheet: (v) => set({ modelsLoading_sheet: v }),
    setReasoningLevel_sheet: (v) => set({ reasoningLevel_sheet: v }),
    setrecordstatus_sheet: (v) => set({ recordstatus_sheet: v }),
    setloadingrecord_sheet: (v) => set({ loadingrecord_sheet: v }),
    updateSessionMessages_sheet: (updater) => set((state) => ({ sessionmessage_sheet: updater(state.sessionmessage_sheet) })),
}))
