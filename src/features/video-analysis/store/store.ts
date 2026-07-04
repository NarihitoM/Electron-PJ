import { create } from "zustand"
import type { summaryoutput, timestamps } from "../types"
import type { ModelEntry } from "@/shared/lib/modelsapi"

interface VideoClientState {
    provider: string;
    model: string;
    videoSrc: string | null;
    videoFile: File | null;
    summary: summaryoutput | null;
    timestamps: timestamps[];
    loadingupload: boolean;
    analysisError: boolean;
    modelList: ModelEntry[];
    modelsLoading: boolean;
    modelOpen: boolean;
    Api: any[];
    isPending: boolean;
    setsummary: (summary: summaryoutput | null) => void;
    settimestamps: (timestamps: timestamps[]) => void;
    setVideoSrc: (videosrc: string | null) => void;
    setVideoFile: (videofile: File | null) => void;
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    setloadingupload: (loading: boolean) => void;
    setanalysisError: (error: boolean) => void;
    setmodelList: (list: ModelEntry[]) => void;
    setmodelsLoading: (loading: boolean) => void;
    setmodelOpen: (open: boolean) => void;
    setApi: (api: any[]) => void;
    setisPending: (pending: boolean) => void;
    generateTranscript: (() => Promise<void>) | null;
    handleClearVideo: ((e: React.MouseEvent) => void) | null;
    handleContainerClick: (() => void) | null;
    registerHandlers: (handlers: {
        generateTranscript: () => Promise<void>;
        handleClearVideo: (e: React.MouseEvent) => void;
        handleContainerClick: () => void;
    }) => void;
}

export const videoauthstore = create<VideoClientState>((set) => ({
    provider: "",
    model: "",
    videoSrc: null,
    videoFile: null,
    summary: null,
    timestamps: [],
    loadingupload: false,
    analysisError: false,
    modelList: [],
    modelsLoading: false,
    modelOpen: false,
    Api: [],
    isPending: false,
    setsummary: (summary) => set({ summary }),
    settimestamps: (timestamps) => set({ timestamps }),
    setVideoSrc: (videoSrc) => set({ videoSrc }),
    setVideoFile: (videoFile) => set({ videoFile }),
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    setloadingupload: (loadingupload) => set({ loadingupload }),
    setanalysisError: (analysisError) => set({ analysisError }),
    setmodelList: (modelList) => set({ modelList }),
    setmodelsLoading: (modelsLoading) => set({ modelsLoading }),
    setmodelOpen: (modelOpen) => set({ modelOpen }),
    setApi: (Api) => set({ Api }),
    setisPending: (isPending) => set({ isPending }),
    generateTranscript: null,
    handleClearVideo: null,
    handleContainerClick: null,
    registerHandlers: (handlers) => set({
        generateTranscript: handlers.generateTranscript,
        handleClearVideo: handlers.handleClearVideo,
        handleContainerClick: handlers.handleContainerClick,
    }),
}))
