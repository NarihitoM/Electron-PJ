import { create } from "zustand"
import type { chatsession } from "@/shared/types/globaltype"
import type { slackcrondata } from "../types"

const initialSlackCron: slackcrondata = {
    isActive: false,
    channel: "",
    roomId: "",
    workspace: "",
    model: "",
    provider: "",
    message: "",
    crontype: "",
    triggerAt: "",
    timezone: "",
    customSchedule: ""
}

interface SlackClientState {
    provider: string;
    model: string;
    selectedChannelId: string;
    sessionmessage: chatsession[];
    sending: boolean;
    pendingApproval: { name: string; query: Record<string, unknown> | null } | null;
    pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
    threadIdRef: { current: string | null };
    lightboxImages: string[];
    lightboxIndex: number;
    lightboxOpen: boolean;
    uploadingImages: boolean;
    uploadingImageUrls: Set<string>;
    isChecking: boolean;
    nextCursor: string | null;
    hasMore: boolean;
    mode: string;
    channelid: string | null;
    loadingslackdelmsg: boolean;
    opencron: boolean;
    slackcron: slackcrondata;
    loadingcroncreate: boolean;
    cronModelList: { model: string; capabilities: string[] }[];
    modelOpen: boolean;
    customDayOfWeek: number[];
    customDayOfMonth: number[];
    customMonth: number[];
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    setSelectedChannelId: (id: string) => void;
    setsessionmessage: (v: chatsession[] | ((prev: chatsession[]) => chatsession[])) => void;
    setSending: (v: boolean) => void;
    setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;
    setLightboxImages: (v: string[]) => void;
    setLightboxIndex: (v: number) => void;
    setLightboxOpen: (v: boolean) => void;
    setUploadingImages: (v: boolean) => void;
    setUploadingImageUrls: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
    setIsChecking: (v: boolean) => void;
    setNextCursor: (v: string | null) => void;
    setHasMore: (v: boolean) => void;
    setMode: (v: string) => void;
    setChannelid: (v: string | null) => void;
    setLoadingslackdelmsg: (v: boolean) => void;
    setOpencron: (v: boolean) => void;
    setSlackcron: (v: slackcrondata | ((prev: slackcrondata) => slackcrondata)) => void;
    setLoadingcroncreate: (v: boolean) => void;
    setCronModelList: (v: { model: string; capabilities: string[] }[]) => void;
    setModelOpen: (v: boolean) => void;
    setCustomDayOfWeek: (v: number[]) => void;
    setCustomDayOfMonth: (v: number[]) => void;
    setCustomMonth: (v: number[]) => void;
    resetslack: () => void;
}

export const slackauthstore = create<SlackClientState>((set, get) => ({
    provider: "",
    model: "",
    selectedChannelId: "",
    sessionmessage: [],
    sending: false,
    pendingApproval: null,
    pendingApprovalRef: { current: null },
    threadIdRef: { current: null },
    lightboxImages: [],
    lightboxIndex: 0,
    lightboxOpen: false,
    uploadingImages: false,
    uploadingImageUrls: new Set(),
    isChecking: false,
    nextCursor: null,
    hasMore: false,
    mode: "",
    channelid: null,
    loadingslackdelmsg: false,
    opencron: false,
    slackcron: initialSlackCron,
    loadingcroncreate: false,
    cronModelList: [],
    modelOpen: false,
    customDayOfWeek: [],
    customDayOfMonth: [],
    customMonth: [],
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    setSelectedChannelId: (selectedChannelId) => set({ selectedChannelId }),
    setsessionmessage: (v) =>
        set({ sessionmessage: typeof v === 'function' ? (v as (prev: chatsession[]) => chatsession[])(get().sessionmessage) : v }),
    setSending: (sending) => set({ sending }),
    setPendingApproval: (pendingApproval) => set({ pendingApproval }),
    setLightboxImages: (lightboxImages) => set({ lightboxImages }),
    setLightboxIndex: (lightboxIndex) => set({ lightboxIndex }),
    setLightboxOpen: (lightboxOpen) => set({ lightboxOpen }),
    setUploadingImages: (uploadingImages) => set({ uploadingImages }),
    setUploadingImageUrls: (v) =>
        set({ uploadingImageUrls: typeof v === 'function' ? (v as (prev: Set<string>) => Set<string>)(get().uploadingImageUrls) : v }),
    setIsChecking: (isChecking) => set({ isChecking }),
    setNextCursor: (nextCursor) => set({ nextCursor }),
    setHasMore: (hasMore) => set({ hasMore }),
    setMode: (mode) => set({ mode }),
    setChannelid: (channelid) => set({ channelid }),
    setLoadingslackdelmsg: (loadingslackdelmsg) => set({ loadingslackdelmsg }),
    setOpencron: (opencron) => set({ opencron }),
    setSlackcron: (v) =>
        set({ slackcron: typeof v === 'function' ? (v as (prev: slackcrondata) => slackcrondata)(get().slackcron) : v }),
    setLoadingcroncreate: (loadingcroncreate) => set({ loadingcroncreate }),
    setCronModelList: (cronModelList) => set({ cronModelList }),
    setModelOpen: (modelOpen) => set({ modelOpen }),
    setCustomDayOfWeek: (customDayOfWeek) => set({ customDayOfWeek }),
    setCustomDayOfMonth: (customDayOfMonth) => set({ customDayOfMonth }),
    setCustomMonth: (customMonth) => set({ customMonth }),
    resetslack: () => set({ provider: "", model: "", selectedChannelId: "" }),
}))
