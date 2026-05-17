import { chatsession } from "./globaltype"

export interface pages {
    id: string,
    title: string
}

export interface notiondata {
    workspacename: string,
    pages: pages[]
}

export interface Apiresponse<T = void> {
    success: true,
    message: string,
    data?: T
}

export type returnnotionmsg = Apiresponse<chatsession[]>;
export type returnnotionfeedback = Apiresponse;
export type returnnotionacc = Apiresponse<notiondata>;


export interface createnotion {
    loadingnotion: boolean,
    loadingnotiondelete: boolean,
    loadingnotionmsg: boolean,
    hasfetch: boolean,
    workspacename: string | null,
    pages: pages[],

    provider: string,
    model: string,
    setProvider: (provider: string) => void,
    setModel: (model: string) => void,
    resetnotion: () => void,
    fetchnotionacc: () => Promise<void>
    fetchnotionmsg: () => Promise<returnnotionmsg>,
    sendmessage: (
        content: string,
        provider: string,
        model: string,
        id: string,
        name: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string; error: string }) => void
    ) => Promise<void>,
    deletenotionservice: () => Promise<returnnotionfeedback>,
    deletenotionmessage: () => Promise<returnnotionfeedback>
}