export interface chatfetch {
    id: string;
    title: string;
    userId: string;
}

export interface ToolCallSignal {
    id: string;
    name: string;
    status: "loading" | "done" | "error";
}

export interface messagefetch {
    id: number
    role: string
    content: string
    images?: string[]
    generatedImages?: string[]
    provider?: string
    model?: string
    toolCalls?: ToolCallSignal[];
}

export interface paginatedMessages {
    messages: messagefetch[];
    nextCursor: number | null;
    hasMore: boolean;
}

export interface newchatdata extends chatfetch {
    createdAt: string;
}

export interface paginatedChats {
    messages: chatfetch[];
    nextCursor: string | null;
    hasMore: boolean;
}

export interface ApiResponse<T = void> {
    success: boolean
    message: string
    data?: T
    title?: string
}

//Types
export type authchatdata = ApiResponse<paginatedChats>;
export type authchatfeedback = ApiResponse<newchatdata>;
export type authmessagedata = ApiResponse<paginatedMessages>;

export interface createchat {

    Chat: chatfetch[],
    loadingchat : boolean,
    chatNextCursor: string | null;
    chatHasMore: boolean;
    chatLoadingMore: boolean;

    provider: string;
    model: string;
    reasoningLevel: "" | "low" | "medium" | "high";


    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    setReasoningLevel: (level: "" | "low" | "medium" | "high") => void;


    resetchat: () => void,
    createchat: (
    ) => Promise<authchatfeedback>,
    fetchchat: (
        cursor?: string
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
        images?: string[],
        onChunk?: (chunk: string, title?: string) => void,
                onStatus?: (status: { type: string; step: string; tool?: string; name?: string; input?: string; output?: string; id: string; query: string; result: string; error: string }) => void,
                onApproval?: (approval: { thread_id: string; tool_calls: Array<{ name: string; query: any; id: string }> }) => void,
                signal?: AbortSignal,
                reasoningLevel?: "" | "low" | "medium" | "high",
                onImage?: (url: string) => void,
    ) => Promise<void>,
    fetchmessage: (
        chatid: string,
        cursor?: number,
        limit?: number
    ) => Promise<authmessagedata>
}