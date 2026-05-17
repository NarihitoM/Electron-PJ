
export interface webdata {
    id : string,
    role : string,
    content : string
}

export interface Apiresponse<T = void> {
   success : boolean,
   message : string,
   data : T
}

export type returnwebdata = Apiresponse<webdata[]>
export type returnwebfeedback = Apiresponse;

export interface createwebscrap {
    loadingdelete : boolean,
    provider: string,
    model: string,

    setProvider: (provider: string) => void, 
    setModel: (model: string) => void,

    resetweb: () => void,
    sendmessage: (
        provider: string,
        model: string,
        content: string,
        onChunk: (chunk: string) => void
    ) => Promise<void>;
    fetchweb : (
    ) => Promise<returnwebdata>,
    deleteweb : (
    ) => Promise<returnwebfeedback>
}
