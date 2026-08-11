import type { ModelEntry } from "@/shared/lib/modelsapi";

export interface summaryoutput {
  title: string;
  summary: string;
  category: string;
}

export interface timestamps {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface returndata {
  transcription: timestamps[];
  summary: summaryoutput;
}

export interface returnsignurl {
  url: string;
}

export interface Apiresponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export type returnvideofeedback = Apiresponse;
export type returnvideodata = Apiresponse<returndata>;
export type returnvideourl = Apiresponse<returnsignurl>;

export interface VideoClientState {
  provider: string;
  model: string;
  videoSrc: string | null;
  videoFile: File | null;
  summary: summaryoutput | null;
  timestamps: timestamps[];
  loadingupload: boolean;
  analysisError: boolean;
  modelList: ModelEntry[];
  modelsLoading: boolean;
  modelOpen: boolean;
  Api: any[];
  isPending: boolean;
  setsummary: (summary: summaryoutput | null) => void;
  settimestamps: (timestamps: timestamps[]) => void;
  setVideoSrc: (videosrc: string | null) => void;
  setVideoFile: (videofile: File | null) => void;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setloadingupload: (loading: boolean) => void;
  setanalysisError: (error: boolean) => void;
  setmodelList: (list: ModelEntry[]) => void;
  setmodelsLoading: (loading: boolean) => void;
  setmodelOpen: (open: boolean) => void;
  setApi: (api: any[]) => void;
  setisPending: (pending: boolean) => void;
  generateTranscript: (() => Promise<void>) | null;
  handleClearVideo: ((e: React.MouseEvent) => void) | null;
  handleContainerClick: (() => void) | null;
  registerHandlers: (handlers: {
    generateTranscript: () => Promise<void>;
    handleClearVideo: (e: React.MouseEvent) => void;
    handleContainerClick: () => void;
  }) => void;
}

export interface createvideo {
  loadinggenerate: boolean;
  provider: string;
  model: string;
  videoSrc: string | null;
  videoFile: File | null;
  summary: summaryoutput | null;
  timestamps: timestamps[];
  setsummary: (summary: summaryoutput | null) => void;
  settimestamps: (timestamps: timestamps[]) => void;
  setVideoSrc: (videosrc: string | null) => void;
  setVideoFile: (videofile: File | null) => void;

  setProvider: (provider: string) => void;
  setModel: (model: string) => void;

  videotranscript: (url: string, provider: string, model: string) => Promise<returnvideodata>;
}
