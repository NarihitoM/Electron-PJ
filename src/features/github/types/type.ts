import { chatsession } from "../../../shared/types/globaltype";

export interface repos {
  id: number;
  full_name: string;
  private: boolean;
  description: string | null;
  url: string;
}

export interface githubdata {
  username: string;
  repos: repos[];
}

export interface Apiresponse<T = void> {
  success: true;
  message: string;
  data?: T;
}

export type returngithubmsg = Apiresponse<{
  messages: chatsession[];
  nextCursor: string | null;
  hasMore: boolean;
}>;
export type returngithubfeedback = Apiresponse;
export type returngithubacc = Apiresponse<githubdata>;

export interface GithubClientState {
  provider: string;
  model: string;
  sessionmessage: chatsession[];
  input: string;
  sending: boolean;
  loadingfetch: boolean;
  loadingerror: boolean;
  loadinggithubmsg: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  type: string | null;
  repoid: string | null;
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
  modelList: import("@/shared/lib/modelsapi").ModelEntry[];
  modelsLoading: boolean;
  reasoningLevel: "" | "low" | "medium" | "high";

  setProvider: (v: string) => void;
  setModel: (v: string) => void;
  setsessionmessage: (v: chatsession[]) => void;
  setInput: (v: string) => void;
  setSending: (v: boolean) => void;
  setloadingfetch: (v: boolean) => void;
  setloadingerror: (v: boolean) => void;
  setloadinggithubmsg: (v: boolean) => void;
  setNextCursor: (v: string | null) => void;
  setHasMore: (v: boolean) => void;
  setLoadingMore: (v: boolean) => void;
  settype: (v: string | null) => void;
  setrepoid: (v: string | null) => void;
  setIsChecking: (v: boolean) => void;
  setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;
  setLightboxImages: (v: string[]) => void;
  setLightboxIndex: (v: number) => void;
  setLightboxOpen: (v: boolean) => void;
  setCopiedIndex: (v: number | null) => void;
  setUploadingImages: (v: boolean) => void;
  setUploadingImageUrls: (v: Set<string>) => void;
  setPendingImages: (v: File[]) => void;
  setModelList: (v: import("@/shared/lib/modelsapi").ModelEntry[]) => void;
  setModelsLoading: (v: boolean) => void;
  setReasoningLevel: (v: "" | "low" | "medium" | "high") => void;

  resetgithub: () => void;
  updateSessionMessages: (updater: (prev: chatsession[]) => chatsession[]) => void;
}
