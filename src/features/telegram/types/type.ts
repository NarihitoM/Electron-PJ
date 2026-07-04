import { chatsession } from "../../../shared/types/globaltype";

export interface telegramfeedback {
    success: boolean,
    message: string
}
export interface TelegramChatEntity {
    id: string;
    title: string;
}

export interface TelegramContactEntity {
    id: string;
    name: string;
    username: string;
}

export interface TelegramUserData {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    groups: TelegramChatEntity[];
    contacts: TelegramContactEntity[];
}

export interface telegramcrondata {
    isActive: boolean,
    channel: string,
    chatId: string,
    model: string,
    provider: string,
    message: string,
    crontype: string,
    triggerAt: string,
    timezone: string,
    customSchedule?: string
}


export interface Apiresponse<T = void> extends telegramfeedback {
    data?: T
}

export type returntelegramfeedback = Apiresponse<TelegramUserData>
export type returntelegrammessage = Apiresponse<{
    messages: chatsession[];
    nextCursor: string | null;
    hasMore: boolean;
}>
export type returntelegramcrondata = Apiresponse<telegramcrondata>

export interface TelegramClientState {
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

export interface createTelegram {
    loading: boolean,
    loadingverify: boolean,
    loadingfetch: boolean,
    loadingdeleteservice: boolean,
    loadingdeletemsg: boolean,
    loadingcroncreate: boolean,
    loadingcronfetch: boolean,


    userdata: TelegramUserData | null,
    groups: TelegramChatEntity[],
    contacts: TelegramContactEntity[],

    provider: string,
    model: string,
    mode: string,
    selectedGroupId: string,
    selectedContactId: string,
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    setmode: (mode: string) => void,
    setSelectedGroupId: (selectedGroupId: string) => void,
    setSelectedContactId: (selectedContactId: string) => void,

    resettelegram: () => void,
    sendmessage: (
        content: string,
        provider: string,
        model: string,
        id: string,
        type: string,
        images?: string[],
        onChunk?: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string; error: string }) => void,
        onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
        signal?: AbortSignal,
        reasoningLevel?: "" | "low" | "medium" | "high",
        onImage?: (url: string) => void
    ) => Promise<void>,
    telegramcreate: (
        phone: string,
        password: string
    ) => Promise<telegramfeedback>,
    telegramfetchdata: () => Promise<void>,
    telegrammsgreset: () => Promise<returntelegramfeedback>,
    telegramservicereset: () => Promise<returntelegramfeedback>,
    telegramverify: (
        phonecode: string,
    ) => Promise<returntelegramfeedback>,
    fetchtelegrammessage: (cursor?: string, limit?: number) => Promise<returntelegrammessage>,
    telegramcroncreate: (
        data: telegramcrondata
    ) => Promise<returntelegramfeedback>
    telegramcronget: () => Promise<returntelegramcrondata>
}
