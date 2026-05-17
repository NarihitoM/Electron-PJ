export interface agentsession {
    role : string,
    content : string,
    name : string
}
export interface nodedata {
    id: string,
    name: string,
    provider: string,
    actor: string,
    model: string,
    tool : string,
    systemprompt: string
}

export interface ApiResponse<T = void> {
    success: boolean,
    message: string,
    data?: T,
    key? : string
}

export type returnnodefeedback = ApiResponse;
export type returnnodedata = ApiResponse<nodedata[]>
export type returnagentmessagedata = ApiResponse<agentsession[]>
export type returnagentmessagefeedback = ApiResponse;

export interface createAgent {
    //Data
    Node: nodedata[],

    //Loading
    loadingfetch : boolean,
    loadingnode : boolean,

    type : string,
    settype : (type : string) => void,

    resetagent: () => void,
    //Functions
    addnode: (
        name: string,
        provider: string,
        actor: string,
        model: string,
        tool : string,
        prompt: string
    ) => Promise<returnnodefeedback>,
    fetchnode : () => Promise<void>,
    updatenode: (
        nodeid : string,
        name: string,
        provider: string,
        actor: string,
        model: string,
        tool : string,
        prompt: string
    ) => Promise<returnnodefeedback>,
    deletenode: (
        nodeid : string
    ) => Promise<returnnodefeedback>,
    fetchagentmessages: () => Promise<returnagentmessagedata>,
    storeagentmessage: (
        role : string,
        content : string,
        name : string
    ) => Promise<returnagentmessagefeedback>
}