import { chatsession } from "./globaltype";

export interface googledata {
    id: string,
    name: string,
    url: string
}

export interface google {
    serviceemail: string,
    googlesheet: googledata[],
    googledocs: googledata[]
}

export interface Apiresponse<T = void> {
    success: boolean,
    message: string,
    data?: T
}

export type returngooglefeedback = Apiresponse<google>;
export type returngooglefetchmessage = Apiresponse<chatsession[]>

export interface creategoogle {
    loading: boolean,
    loadingfetch: boolean,
    loadingsheet: boolean,
    hasfetch : boolean,
    loadingdocs: boolean,
    loadinggoogleservicedelete : boolean,
    loadingsheetdelete : boolean,
    loadingdocsdelete : boolean,

    provider: string,
    model: string,
    sheeturl: string,
    docsurl: string,
    sheet: googledata[],
    docs: googledata[],
    serviceemail: string | null,

    setsheeturl: (url: string) => void,
    setdocsurl: (url: string) => void,
    setProvider: (provider: string) => void,
    setModel: (model: string) => void,

    resetgoogle: () => void,

    addgoogleservice: (
        serviceemail: string,
        servicekey: string
    ) => Promise<returngooglefeedback>
    addgooglesheet: (
        sheeturl: string
    ) => Promise<returngooglefeedback>
    addgoogledocs: (
        docsurl: string
    ) => Promise<returngooglefeedback>,
    fetchgoogleservice: () => Promise<void>,
    deletegoogleservice : () => Promise<returngooglefeedback>,
    deletesheetmsg : () => Promise<returngooglefeedback>,
    deletedocsmsg : () => Promise<returngooglefeedback>,
    fetchsheetmessage: () => Promise<returngooglefetchmessage>,
    fetchdocsmessage: () => Promise<returngooglefetchmessage>,
    sendsheetmessage: (
        content: string,
        provider: string,
        model: string,
        url: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string; error : string }) => void
    ) => Promise<void>,
    senddocsmessage: (
        content: string,
        provider: string,
        model: string,
        url: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string ; error : string}) => void
    ) => Promise<void>,
}


