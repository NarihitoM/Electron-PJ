import { create } from "zustand"
import type { chatsession } from "@/shared/types/globaltype"
import type { telegramcrondata } from "@/features/telegram/types"

const initialTelegramCron: telegramcrondata = {
    isActive: false,
    channel: "",
    chatId: "",
    model: "",
    provider: "",
    message: "",
    crontype: "",
    triggerAt: "",
    timezone: "",
    customSchedule: ""
}

interface TelegramClientState {
    provider: string;
    model: string;
    mode: string;
    selectedGroupId: string;
    selectedContactId: string;
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
    type: string;
    hover: boolean;
    opencreate: boolean;
    openverify: boolean;
    opencron: boolean;
    phonenumber: string;
    countryCode: string;
    phonecode: string;
    password: string;
    loading: boolean;
    loadingverify: boolean;
    loadingdeletemsg: boolean;
    loadingcroncreate: boolean;
    pendingApproval: { name: string; query: Record<string, unknown> | null } | null;
    pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
    threadIdRef: { current: string | null };
    lightboxImages: string[];
    lightboxIndex: number;
    lightboxOpen: boolean;
    copiedIndex: number | null;
    telegramcron: telegramcrondata;
    customDayOfWeek: number[];
    customDayOfMonth: number[];
    customMonth: number[];

    setProvider: (v: string) => void;
    setModel: (v: string) => void;
    setmode: (v: string) => void;
    setSelectedGroupId: (v: string) => void;
    setSelectedContactId: (v: string) => void;
    setsessionmessage: (v: chatsession[]) => void;
    setInput: (v: string) => void;
    setSending: (v: boolean) => void;
    setReasoningLevel: (v: "" | "low" | "medium" | "high") => void;
    setPendingImages: (v: File[]) => void;
    setUploadingImages: (v: boolean) => void;
    setUploadingImageUrls: (v: Set<string>) => void;
    setloadingfetch: (v: boolean) => void;
    setloadingerror: (v: boolean) => void;
    setNextCursor: (v: string | null) => void;
    setHasMore: (v: boolean) => void;
    setLoadingMore: (v: boolean) => void;
    settype: (v: string) => void;
    setHover: (v: boolean) => void;
    setOpencreate: (v: boolean) => void;
    setOpenverify: (v: boolean) => void;
    setOpencron: (v: boolean) => void;
    setPhonenumber: (v: string) => void;
    setCountryCode: (v: string) => void;
    setPhonecode: (v: string) => void;
    setPassword: (v: string) => void;
    setLoading: (v: boolean) => void;
    setLoadingverify: (v: boolean) => void;
    setLoadingdeletemsg: (v: boolean) => void;
    setLoadingcroncreate: (v: boolean) => void;
    setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;
    setLightboxImages: (v: string[]) => void;
    setLightboxIndex: (v: number) => void;
    setLightboxOpen: (v: boolean) => void;
    setCopiedIndex: (v: number | null) => void;
    setTelegramcron: (v: telegramcrondata) => void;
    setCustomDayOfWeek: (v: number[]) => void;
    setCustomDayOfMonth: (v: number[]) => void;
    setCustomMonth: (v: number[]) => void;
    resettelegram: () => void;
    updateSessionMessages: (updater: (prev: chatsession[]) => chatsession[]) => void;
}

export const telegramauthstore = create<TelegramClientState>((set) => ({
    provider: "",
    model: "",
    mode: "group",
    selectedGroupId: "",
    selectedContactId: "",
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
    type: "",
    hover: false,
    opencreate: false,
    openverify: false,
    opencron: false,
    phonenumber: "",
    countryCode: "+95",
    phonecode: "",
    password: "",
    loading: false,
    loadingverify: false,
    loadingdeletemsg: false,
    loadingcroncreate: false,
    pendingApproval: null,
    pendingApprovalRef: { current: null },
    threadIdRef: { current: null },
    lightboxImages: [],
    lightboxIndex: 0,
    lightboxOpen: false,
    copiedIndex: null,
    telegramcron: { ...initialTelegramCron },
    customDayOfWeek: [],
    customDayOfMonth: [],
    customMonth: [],

    setProvider: (v) => set({ provider: v, model: "" }),
    setModel: (v) => set({ model: v }),
    setmode: (v) => set({ mode: v }),
    setSelectedGroupId: (v) => set({ selectedGroupId: v }),
    setSelectedContactId: (v) => set({ selectedContactId: v }),
    setsessionmessage: (v) => set({ sessionmessage: v }),
    setInput: (v) => set({ input: v }),
    setSending: (v) => set({ sending: v }),
    setReasoningLevel: (v) => set({ reasoningLevel: v }),
    setPendingImages: (v) => set({ pendingImages: v }),
    setUploadingImages: (v) => set({ uploadingImages: v }),
    setUploadingImageUrls: (v) => set({ uploadingImageUrls: v }),
    setloadingfetch: (v) => set({ loadingfetch: v }),
    setloadingerror: (v) => set({ loadingerror: v }),
    setNextCursor: (v) => set({ nextCursor: v }),
    setHasMore: (v) => set({ hasMore: v }),
    setLoadingMore: (v) => set({ loadingMore: v }),
    settype: (v) => set({ type: v }),
    setHover: (v) => set({ hover: v }),
    setOpencreate: (v) => set({ opencreate: v }),
    setOpenverify: (v) => set({ openverify: v }),
    setOpencron: (v) => set({ opencron: v }),
    setPhonenumber: (v) => set({ phonenumber: v }),
    setCountryCode: (v) => set({ countryCode: v }),
    setPhonecode: (v) => set({ phonecode: v }),
    setPassword: (v) => set({ password: v }),
    setLoading: (v) => set({ loading: v }),
    setLoadingverify: (v) => set({ loadingverify: v }),
    setLoadingdeletemsg: (v) => set({ loadingdeletemsg: v }),
    setLoadingcroncreate: (v) => set({ loadingcroncreate: v }),
    setPendingApproval: (v) => set({ pendingApproval: v }),
    setLightboxImages: (v) => set({ lightboxImages: v }),
    setLightboxIndex: (v) => set({ lightboxIndex: v }),
    setLightboxOpen: (v) => set({ lightboxOpen: v }),
    setCopiedIndex: (v) => set({ copiedIndex: v }),
    setTelegramcron: (v) => set({ telegramcron: v }),
    setCustomDayOfWeek: (v) => set({ customDayOfWeek: v }),
    setCustomDayOfMonth: (v) => set({ customDayOfMonth: v }),
    setCustomMonth: (v) => set({ customMonth: v }),
    resettelegram: () => set({ provider: "", model: "", mode: "group", selectedGroupId: "", selectedContactId: "" }),
    updateSessionMessages: (updater) => set((state) => ({ sessionmessage: updater(state.sessionmessage) })),
}))
