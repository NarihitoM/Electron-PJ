import { chatsession } from "../../../shared/types/globaltype";

export interface viberacc {
  viberUserId: string;
  name?: string;
}

export interface Apiresponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export type returnviberacc = Apiresponse<viberacc>;
export type returnviberfeedback = Apiresponse;
export type returnvibermsg = Apiresponse<{
  messages: chatsession[];
  nextCursor: string | null;
  hasMore: boolean;
}>;

export interface ViberClientState {
  provider: string;
  model: string;
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
  loadingviberdelmsg: boolean;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
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
  setLoadingviberdelmsg: (v: boolean) => void;
  resetviber: () => void;
}

export interface createviber {
  loadingviber: boolean;
  loadingviberdelete: boolean;
  loadingviberdelmsg: boolean;

  viberUserId: string | null;
  name: string | null;
  provider: string;
  model: string;
  setModel: (model: string) => void;
  setProvider: (provider: string) => void;

  resetviber: () => void;
  fetchviberacc: () => Promise<void>;
  fetchvibermessage: (cursor?: string, limit?: number) => Promise<returnvibermsg>;
  deletevibermsg: () => Promise<returnviberfeedback>;
  deleteviberservice: () => Promise<returnviberfeedback>;
  sendvibermessage: (
    content: string,
    provider: string,
    model: string,
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
}
