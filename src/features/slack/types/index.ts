import { chatsession } from "../../../shared/types/globaltype";

export interface channels {
    id: string,
    name: string
}



export interface slackacc {
    workspace: string,
    public: channels[],
    private: channels[],
    im: channels[],
    mpim: channels[]
}

export interface slackcrondata {
    isActive : boolean,
    channel : string,
    roomId : string,
    workspace : string,
    model : string,
    provider : string,
    message : string,
    crontype : string,
    triggerAt : string,
    timezone : string,
    customSchedule?: string
}

export interface Apiresponse<T = void> {
    success: boolean,
    message: string,
    data?: T
}

export type returnslackacc = Apiresponse<slackacc>
export type returnslackfeedback = Apiresponse;
export type returnslackmsg = Apiresponse<{
    messages: chatsession[];
    nextCursor: string | null;
    hasMore: boolean;
}>
export type returnslackcron = Apiresponse<slackcrondata>

export interface createslack {
    loadingslack: boolean,
    loadingslackdelete: boolean,
    loadingslackdelmsg: boolean,
    loadingcroncreate: boolean,
    loadingcronfetch: boolean,


    workspace: string | null,
    public: channels[],
    private: channels[],
    im: channels[],
    mpim: channels[],
    provider: string,
    model: string,
    setModel: (model: string) => void;
    setProvider: (provider: string) => void;


    resetslack: () => void,
    fetchslackacc: () => Promise<void>,
    fetchslackmessage: (cursor?: string, limit?: number) => Promise<returnslackmsg>,
    deleteslackmsg: () => Promise<returnslackfeedback>,
    deleteslackservice: () => Promise<returnslackfeedback>,
    sendslackmessage: (
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
    slackcroncreate: (
        data: slackcrondata
    ) => Promise<returnslackfeedback>
    slackcronget: () => Promise<returnslackcron>
}
