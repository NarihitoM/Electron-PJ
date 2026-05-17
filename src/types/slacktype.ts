import { chatsession } from "./globaltype";

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

export interface Apiresponse<T = void> {
    success: boolean,
    message: string,
    data?: T
}

export type returnslackacc = Apiresponse<slackacc>
export type returnslackfeedback = Apiresponse;
export type returnslackmsg = Apiresponse<chatsession[]>

export interface createslack {
    loadingslack: boolean,
    loadingslackdelete : boolean,
    loadingslackdelmsg : boolean,
    hasfetch : boolean,
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
    fetchslackmessage : () => Promise<returnslackmsg>,
    deleteslackmsg : () => Promise<returnslackfeedback>,
    deleteslackservice : () => Promise<returnslackfeedback>,
    sendslackmessage : (
        content: string,
        provider: string,
        model: string,
        id: string,
        name: string,
        type: string,
        onChunk: (chunk: string) => void,
        onStatus?: (status: { type: string; step: string; tool?: string; id: string; query: string; result: string ; error : string }) => void
    ) => Promise<void>
}
