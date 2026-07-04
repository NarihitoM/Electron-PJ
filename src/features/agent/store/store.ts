import { create } from "zustand"
import type { agentsession } from "../types"
import type { nodes } from "@/shared/types/globaltype"
import type { ModelEntry } from "@/shared/lib/modelsapi"

interface AgentClientState {
    type: string;
    setType: (type: string) => void;
    resetagent: () => void;

    provider: string;
    model: string;
    setProvider: (v: string) => void;
    setModel: (v: string) => void;

    input: string;
    setInput: (v: string) => void;

    selectnode: string | null;
    setSelectnode: (v: string | null) => void;
    firstnode: string | null;
    setFirstnode: (v: string | null) => void;
    lastnode: string | null;
    setLastnode: (v: string | null) => void;

    messageloading: boolean;
    setMessageloading: (v: boolean) => void;
    workflowloading: boolean;
    setWorkflowloading: (v: boolean) => void;

    history: agentsession[];
    setHistory: (v: agentsession[]) => void;
    loadingfetch: boolean;
    setLoadingfetch: (v: boolean) => void;
    loadingerror: boolean;
    setLoadingerror: (v: boolean) => void;
    nextCursor: string | null;
    setNextCursor: (v: string | null) => void;
    hasMore: boolean;
    setHasMore: (v: boolean) => void;
    loadingMore: boolean;
    setLoadingMore: (v: boolean) => void;

    nodes: nodes[];
    setNodes: (v: nodes[] | ((prev: nodes[]) => nodes[])) => void;

    modelList: ModelEntry[];
    setModelList: (v: ModelEntry[]) => void;
    modelsLoading: boolean;
    setModelsLoading: (v: boolean) => void;

    nodeDialogOpen: boolean;
    setNodeDialogOpen: (v: boolean) => void;
    nodeDialogMode: "create" | "update" | "delete";
    setNodeDialogMode: (v: "create" | "update" | "delete") => void;
    nodeid: string;
    setNodeid: (v: string) => void;
    name: string;
    setName: (v: string) => void;
    actor: string;
    setActor: (v: string) => void;
    prompt: string;
    setPrompt: (v: string) => void;
    tool: string | null;
    setTool: (v: string | null) => void;
    toolOpen: boolean;
    setToolOpen: (v: boolean) => void;
    modelOpen: boolean;
    setModelOpen: (v: boolean) => void;

    servicesOpen: boolean;
    setServicesOpen: (v: boolean) => void;

    copiedIndex: number | null;
    setCopiedIndex: (v: number | null) => void;
    lightboxImages: string[];
    setLightboxImages: (v: string[]) => void;
    lightboxIndex: number;
    setLightboxIndex: (v: number) => void;
    lightboxOpen: boolean;
    setLightboxOpen: (v: boolean) => void;

    pendingImages: File[];
    setPendingImages: (v: File[]) => void;
    uploadingImages: boolean;
    setUploadingImages: (v: boolean) => void;
    uploadingImageUrls: Set<string>;
    setUploadingImageUrls: (v: Set<string>) => void;

    pendingToolApproval: { nodeName: string; toolName: string; args: Record<string, unknown> } | null;
    setPendingToolApproval: (v: { nodeName: string; toolName: string; args: Record<string, unknown> } | null) => void;

    topSentinelRef: { current: HTMLDivElement | null };
    scrollContainerRef: { current: HTMLDivElement | null };
    historyEndRef: { current: HTMLDivElement | null };
    workflowGenRef: { current: number };
    pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
    threadIdRef: { current: string | null };

    recordstatus: boolean;
    setRecordstatus: (v: boolean) => void;
    loadingrecord: boolean;
    setLoadingrecord: (v: boolean) => void;

    resetForm: () => void;
    updateHistory: (updater: (prev: agentsession[]) => agentsession[]) => void;
    updateSessionMessages: (updater: (prev: agentsession[]) => agentsession[]) => void;
}

export const useagentstore = create<AgentClientState>((set, get) => ({
    type: "All",
    setType: (type) => set({ type }),
    resetagent: () => set({ type: "All" }),

    provider: "",
    model: "",
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),

    input: "",
    setInput: (input) => set({ input }),

    selectnode: null,
    setSelectnode: (selectnode) => set({ selectnode }),
    firstnode: null,
    setFirstnode: (firstnode) => set({ firstnode }),
    lastnode: null,
    setLastnode: (lastnode) => set({ lastnode }),

    messageloading: false,
    setMessageloading: (messageloading) => set({ messageloading }),
    workflowloading: false,
    setWorkflowloading: (workflowloading) => set({ workflowloading }),

    history: [],
    setHistory: (history) => set({ history }),
    loadingfetch: false,
    setLoadingfetch: (loadingfetch) => set({ loadingfetch }),
    loadingerror: false,
    setLoadingerror: (loadingerror) => set({ loadingerror }),
    nextCursor: null,
    setNextCursor: (nextCursor) => set({ nextCursor }),
    hasMore: false,
    setHasMore: (hasMore) => set({ hasMore }),
    loadingMore: false,
    setLoadingMore: (loadingMore) => set({ loadingMore }),

    nodes: [],
    setNodes: (nodes) => set(typeof nodes === "function" ? { nodes: nodes(get().nodes) } : { nodes }),

    modelList: [],
    setModelList: (modelList) => set({ modelList }),
    modelsLoading: false,
    setModelsLoading: (modelsLoading) => set({ modelsLoading }),

    nodeDialogOpen: false,
    setNodeDialogOpen: (nodeDialogOpen) => set({ nodeDialogOpen }),
    nodeDialogMode: "create",
    setNodeDialogMode: (nodeDialogMode) => set({ nodeDialogMode }),
    nodeid: "",
    setNodeid: (nodeid) => set({ nodeid }),
    name: "",
    setName: (name) => set({ name }),
    actor: "",
    setActor: (actor) => set({ actor }),
    prompt: "",
    setPrompt: (prompt) => set({ prompt }),
    tool: null,
    setTool: (tool) => set({ tool }),
    toolOpen: false,
    setToolOpen: (toolOpen) => set({ toolOpen }),
    modelOpen: false,
    setModelOpen: (modelOpen) => set({ modelOpen }),

    servicesOpen: false,
    setServicesOpen: (servicesOpen) => set({ servicesOpen }),

    copiedIndex: null,
    setCopiedIndex: (copiedIndex) => set({ copiedIndex }),
    lightboxImages: [],
    setLightboxImages: (lightboxImages) => set({ lightboxImages }),
    lightboxIndex: 0,
    setLightboxIndex: (lightboxIndex) => set({ lightboxIndex }),
    lightboxOpen: false,
    setLightboxOpen: (lightboxOpen) => set({ lightboxOpen }),

    pendingImages: [],
    setPendingImages: (pendingImages) => set({ pendingImages }),
    uploadingImages: false,
    setUploadingImages: (uploadingImages) => set({ uploadingImages }),
    uploadingImageUrls: new Set(),
    setUploadingImageUrls: (uploadingImageUrls) => set({ uploadingImageUrls }),

    pendingToolApproval: null,
    setPendingToolApproval: (pendingToolApproval) => set({ pendingToolApproval }),

    topSentinelRef: { current: null },
    scrollContainerRef: { current: null },
    historyEndRef: { current: null },
    workflowGenRef: { current: 0 },
    pendingApprovalRef: { current: null },
    threadIdRef: { current: null },

    recordstatus: false,
    setRecordstatus: (recordstatus) => set({ recordstatus }),
    loadingrecord: false,
    setLoadingrecord: (loadingrecord) => set({ loadingrecord }),

    resetForm: () => set({
        nodeid: "", name: "", actor: "", prompt: "",
        provider: "", model: "", tool: null,
        nodeDialogOpen: false, nodeDialogMode: "create",
        toolOpen: false, modelOpen: false,
    }),

    updateHistory: (updater) => set((state) => ({ history: updater(state.history) })),
    updateSessionMessages: (updater) => set((state) => ({ history: updater(state.history) })),
}))