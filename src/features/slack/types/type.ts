import { chatsession } from "../../../shared/types/globaltype";

export interface channels {
  id: string;
  name: string;
}

export interface slackacc {
  workspace: string;
  public: channels[];
  private: channels[];
  im: channels[];
  mpim: channels[];
}

export interface slackcrondata {
  isActive: boolean;
  channel: string;
  roomId: string;
  workspace: string;
  model: string;
  provider: string;
  message: string;
  crontype: string;
  triggerAt: string;
  timezone: string;
  customSchedule?: string;
}

export interface Apiresponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export type returnslackacc = Apiresponse<slackacc>;
export type returnslackfeedback = Apiresponse;
export type returnslackmsg = Apiresponse<{
  messages: chatsession[];
  nextCursor: string | null;
  hasMore: boolean;
}>;
export type returnslackcron = Apiresponse<slackcrondata>;

export interface SlackClientState {
  provider: string;
  model: string;
  selectedChannelId: string;
  sessionmessage: chatsession[];
  sending: boolean;
  pendingApproval: { name: string; query: Record<string, unknown> | null } | null;
  pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
  threadIdRef: { current: string | null };
  lightboxImages: string[];
  lightboxIndex: number;
  lightboxOpen: boolean;
  uploadingImages: boolean;
  uploadingImageUrls: Set<string>;
  isChecking: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  mode: string;
  channelid: string | null;
  loadingslackdelmsg: boolean;
  opencron: boolean;
  slackcron: slackcrondata;
  loadingcroncreate: boolean;
  cronModelList: { model: string; capabilities: string[] }[];
  modelOpen: boolean;
  customDayOfWeek: number[];
  customDayOfMonth: number[];
  customMonth: number[];
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setSelectedChannelId: (id: string) => void;
  setsessionmessage: (v: chatsession[] | ((prev: chatsession[]) => chatsession[])) => void;
  setSending: (v: boolean) => void;
  setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;
  setLightboxImages: (v: string[]) => void;
  setLightboxIndex: (v: number) => void;
  setLightboxOpen: (v: boolean) => void;
  setUploadingImages: (v: boolean) => void;
  setUploadingImageUrls: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setIsChecking: (v: boolean) => void;
  setNextCursor: (v: string | null) => void;
  setHasMore: (v: boolean) => void;
  setMode: (v: string) => void;
  setChannelid: (v: string | null) => void;
  setLoadingslackdelmsg: (v: boolean) => void;
  setOpencron: (v: boolean) => void;
  setSlackcron: (v: slackcrondata | ((prev: slackcrondata) => slackcrondata)) => void;
  setLoadingcroncreate: (v: boolean) => void;
  setCronModelList: (v: { model: string; capabilities: string[] }[]) => void;
  setModelOpen: (v: boolean) => void;
  setCustomDayOfWeek: (v: number[]) => void;
  setCustomDayOfMonth: (v: number[]) => void;
  setCustomMonth: (v: number[]) => void;
  resetslack: () => void;
}

export interface createslack {
  loadingslack: boolean;
  loadingslackdelete: boolean;
  loadingslackdelmsg: boolean;
  loadingcroncreate: boolean;
  loadingcronfetch: boolean;

  workspace: string | null;
  public: channels[];
  private: channels[];
  im: channels[];
  mpim: channels[];
  provider: string;
  model: string;
  setModel: (model: string) => void;
  setProvider: (provider: string) => void;

  resetslack: () => void;
  fetchslackacc: () => Promise<void>;
  fetchslackmessage: (cursor?: string, limit?: number) => Promise<returnslackmsg>;
  deleteslackmsg: () => Promise<returnslackfeedback>;
  deleteslackservice: () => Promise<returnslackfeedback>;
  sendslackmessage: (
    content: string,
    provider: string,
    model: string,
    id: string,
    name: string,
    type: string,
    images?: string[],
    onChunk?: (chunk: string) => void,
    onStatus?: (status: {
      type: string;
      step: string;
      tool?: string;
      name?: string;
      input?: string;
      output?: string;
      id: string;
      query: string;
      result: string;
      error: string;
    }) => void,
    onApproval?: (approval: {
      thread_id: string;
      tool_calls: Array<{ name: string; query: any; id: string }>;
    }) => void,
    signal?: AbortSignal,
    reasoningLevel?: "" | "low" | "medium" | "high",
    onImage?: (url: string) => void,
  ) => Promise<void>;
  slackcroncreate: (data: slackcrondata) => Promise<returnslackfeedback>;
  slackcronget: () => Promise<returnslackcron>;
}
