import { chatsession } from "../../../shared/types/globaltype";

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
export type returngooglefetchmessage = Apiresponse<{
    messages: chatsession[];
    nextCursor: string | null;
    hasMore: boolean;
}>

export interface creategoogle {
    loading: boolean,
    loadingfetch: boolean,
    loadingsheet: boolean,
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
    fetchsheetmessage: (cursor?: string, limit?: number) => Promise<returngooglefetchmessage>,
    fetchdocsmessage: (cursor?: string, limit?: number) => Promise<returngooglefetchmessage>,
    sendsheetmessage: (
        content: string,
        provider: string,
        model: string,
        url: string,
        type: string,
        images?: string[],
        onChunk?: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string; error : string }) => void,
        onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
        signal?: AbortSignal,
        reasoningLevel?: "" | "low" | "medium" | "high",
        onImage?: (url: string) => void
    ) => Promise<void>,
    senddocsmessage: (
        content: string,
        provider: string,
        model: string,
        url: string,
        type: string,
        images?: string[],
        onChunk?: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string ; error : string}) => void,
        onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
        signal?: AbortSignal,
        reasoningLevel?: "" | "low" | "medium" | "high",
        onImage?: (url: string) => void
    ) => Promise<void>,
}


