export interface summaryoutput {
    title: string,
    summary: string,
    category: string
}

export interface timestamps {
    id: number,
    start: number,
    end: number,
    text: string
}

export interface returndata {
    transcription: timestamps[],
    summary: summaryoutput
}

export interface returnsignurl {
    uploadUrl: string,
    path: string
}


export interface Apiresponse<T = void> {
    success: boolean,
    message: string,
    data?: T
}

export type returnvideofeedback = Apiresponse;
export type returnvideodata = Apiresponse<returndata>;
export type returnvideourl = Apiresponse<returnsignurl>

export interface createvideo {
    loadinggenerate: boolean,
    provider: string;
    model: string;
    videoSrc: string | null,
    videoFile: File | null,
    summary: summaryoutput | null,
    timestamps: timestamps[],
    setsummary: (summary: summaryoutput | null) => void,
    settimestamps: (timestamps: timestamps[]) => void,
    setVideoSrc: (videosrc: string | null) => void,
    setVideoFile: (videofile: File | null) => void


    setProvider: (provider: string) => void;
    setModel: (model: string) => void;

    videotranscript: (
        url: string,
        provider: string,
        model: string
    ) => Promise<returnvideodata>
}