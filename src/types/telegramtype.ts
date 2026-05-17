import { chatsession } from "./globaltype";

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


export interface Apiresponse<T = void> extends telegramfeedback {
    data?: T
}

export type returntelegramfeedback = Apiresponse<TelegramUserData>
export type returntelegrammessage = Apiresponse<chatsession[]>

export interface createTelegram {
    loading: boolean,
    loadingverify: boolean,
    loadingfetch: boolean,
    hasfetch: boolean,
    loadingdeleteservice: boolean,
    loadingdeletemsg: boolean,


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
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string ; error : string }) => void
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
    fetchtelegrammessage: () => Promise<returntelegrammessage>
}