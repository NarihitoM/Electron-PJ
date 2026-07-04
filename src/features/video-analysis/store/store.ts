import { create } from "zustand"
import type { summaryoutput, timestamps } from "../types"

interface VideoClientState {
    provider: string;
    model: string;
    videoSrc: string | null;
    videoFile: File | null;
    summary: summaryoutput | null;
    timestamps: timestamps[];
    setsummary: (summary: summaryoutput | null) => void;
    settimestamps: (timestamps: timestamps[]) => void;
    setVideoSrc: (videosrc: string | null) => void;
    setVideoFile: (videofile: File | null) => void;
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
}

export const videoauthstore = create<VideoClientState>((set) => ({
    provider: "",
    model: "",
    videoSrc: null,
    videoFile: null,
    summary: null,
    timestamps: [],
    setsummary: (summary) => set({ summary }),
    settimestamps: (timestamps) => set({ timestamps }),
    setVideoSrc: (videoSrc) => set({ videoSrc }),
    setVideoFile: (videoFile) => set({ videoFile }),
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
}))
