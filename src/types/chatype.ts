export interface chatfetch {
    id: string;
    title: string;
    userId: number;
}

export interface ToolCallSignal {
    id: string;
    name: string;
    status: "loading" | "done" | "error";
}

export interface messagefetch {
    role: string
    content: string
    toolCalls?: ToolCallSignal[];
}

export interface newchatdata extends chatfetch {
    createdAt: string;
}

export interface ApiResponse<T = void> {
    success: boolean
    message: string
    data?: T
    title?: string
}

//Types
export type authchatdata = ApiResponse<chatfetch[]>;
export type authchatfeedback = ApiResponse<newchatdata>;
export type authmessagedata = ApiResponse<messagefetch[]>;

export interface createchat {

    Chat: chatfetch[],
    loadingchat : boolean,

    provider: string;
    model: string;


    setProvider: (provider: string) => void;
    setModel: (model: string) => void;


    resetchat: () => void,
    createchat: (
    ) => Promise<authchatfeedback>,
    fetchchat: (
    ) => Promise<void>,
    deletechat: (
        chatid: string
    ) => Promise<authchatfeedback>,
    sendmessage: (
        chatid: string,
        provider: string,
        model: string,
        content: string,
        type: string,
        onChunk: (chunk: string, title?: string) => void
    ) => Promise<void>,
    fetchmessage: (
        chatid: string
    ) => Promise<authmessagedata>
}