import { chatsession } from "../../../shared/types/globaltype";
import type { ModelEntry } from "@/shared/lib/modelsapi";

export interface pages {
  id: string;
  title: string;
}

export interface notiondata {
  workspacename: string;
  pages: pages[];
}

export interface Apiresponse<T = void> {
  success: true;
  message: string;
  data?: T;
}

export type returnnotionmsg = Apiresponse<{
  messages: chatsession[];
  nextCursor: string | null;
  hasMore: boolean;
}>;
export type returnnotionfeedback = Apiresponse;
export type returnnotionacc = Apiresponse<notiondata>;

export interface NotionClientState {
  provider: string;
  model: string;
  sessionmessage: chatsession[];
  input: string;
  sending: boolean;
  loadingfetch: boolean;
  loadingerror: boolean;
  loadingnotionmsg: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  type: string | null;
  pageid: string | null;
  isChecking: boolean;
  pendingApproval: { name: string; query: Record<string, unknown> | null } | null;
  pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
  threadIdRef: { current: string | null };
  lightboxImages: string[];
  lightboxIndex: number;
  lightboxOpen: boolean;
  copiedIndex: number | null;
  uploadingImages: boolean;
  uploadingImageUrls: Set<string>;
  pendingImages: File[];
  modelList: ModelEntry[];
  modelsLoading: boolean;
  reasoningLevel: "" | "low" | "medium" | "high";

  setProvider: (v: string) => void;
  setModel: (v: string) => void;
  setsessionmessage: (v: chatsession[]) => void;
  setInput: (v: string) => void;
  setSending: (v: boolean) => void;
  setloadingfetch: (v: boolean) => void;
  setloadingerror: (v: boolean) => void;
  setloadingnotionmsg: (v: boolean) => void;
  setNextCursor: (v: string | null) => void;
  setHasMore: (v: boolean) => void;
  setLoadingMore: (v: boolean) => void;
  settype: (v: string | null) => void;
  setpageid: (v: string | null) => void;
  setIsChecking: (v: boolean) => void;
  setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;
  setLightboxImages: (v: string[]) => void;
  setLightboxIndex: (v: number) => void;
  setLightboxOpen: (v: boolean) => void;
  setCopiedIndex: (v: number | null) => void;
  setUploadingImages: (v: boolean) => void;
  setUploadingImageUrls: (v: Set<string>) => void;
  setPendingImages: (v: File[]) => void;
  setModelList: (v: ModelEntry[]) => void;
  setModelsLoading: (v: boolean) => void;
  setReasoningLevel: (v: "" | "low" | "medium" | "high") => void;

  resetnotion: () => void;
  updateSessionMessages: (updater: (prev: chatsession[]) => chatsession[]) => void;
}

export interface createnotion {
  loadingnotion: boolean;
  loadingnotiondelete: boolean;
  loadingnotionmsg: boolean;
  workspacename: string | null;
  pages: pages[];

  provider: string;
  model: string;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  resetnotion: () => void;
  fetchnotionacc: () => Promise<void>;
  fetchnotionmsg: (cursor?: string, limit?: number) => Promise<returnnotionmsg>;
  sendmessage: (
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
  deletenotionservice: () => Promise<returnnotionfeedback>;
  deletenotionmessage: () => Promise<returnnotionfeedback>;
}
