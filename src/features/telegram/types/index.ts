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