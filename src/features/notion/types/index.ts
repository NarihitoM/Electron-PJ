import { chatsession } from "../../../shared/types/globaltype"

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

export type returnnotionmsg = Apiresponse<{
    messages: chatsession[];
    nextCursor: string | null;
    hasMore: boolean;
}>;
export type returnnotionfeedback = Apiresponse;
export type returnnotionacc = Apiresponse<notiondata>;


export interface createnotion {
    loadingnotion: boolean,
    loadingnotiondelete: boolean,
    loadingnotionmsg: boolean,
    workspacename: string | null,
    pages: pages[],

    provider: string,
    model: string,
    setProvider: (provider: string) => void,
    setModel: (model: string) => void,
    resetnotion: () => void,
    fetchnotionacc: () => Promise<void>
    fetchnotionmsg: (cursor?: string, limit?: number) => Promise<returnnotionmsg>,
    sendmessage: (
        content: string,
        provider: string,
        model: string,
        id: string,
        name: string,
        type: string,
        images?: string[],
        onChunk?: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string; error: string }) => void,
        onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
        signal?: AbortSignal,
        reasoningLevel?: "" | "low" | "medium" | "high",
        onImage?: (url: string) => void
    ) => Promise<void>,
    deletenotionservice: () => Promise<returnnotionfeedback>,
    deletenotionmessage: () => Promise<returnnotionfeedback>
}