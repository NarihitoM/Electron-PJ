import { chatsession } from "../../../shared/types/globaltype";

export interface vercelaccountdata {
  connected: boolean;
  username?: string;
  teamId?: string;
}

export interface vercelprojectdata {
  id: string;
  name: string;
  framework?: string | null;
  latestDeployment?: {
    id: string;
    state?: string | null;
    url?: string | null;
    createdAt?: number | null;
  } | null;
}

export interface vercelserviceprovider {
  provider: string;
}

export interface Apiresponse<T = void> {
  success: true;
  message: string;
  data?: T;
}

export type returnvercelmsg = Apiresponse<{
  messages: chatsession[];
  nextCursor: string | null;
  hasMore: boolean;
}>;
export type returnvercelfeedback = Apiresponse;
export type returnvercelacc = Apiresponse<vercelaccountdata>;
export type returnvercelprojects = Apiresponse<vercelprojectdata[]>;

export interface vercelcrondata {
  isActive: boolean;
  model: string;
  provider: string;
  message: string;
  crontype: string;
  triggerAt: string;
  timezone: string;
  customSchedule?: string;
}

export type returnvercelcrondata = Apiresponse<vercelcrondata>;

export interface VercelClientState {
  provider: string;
  model: string;
  projectId: string;
  sessionmessage: chatsession[];
  input: string;
  sending: boolean;
  loadingfetch: boolean;
  loadingerror: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  isChecking: boolean;
  loadingdeletemsg: boolean;
  type: string | null;
  hover: boolean;
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
  opencron: boolean;
  loadingcroncreate: boolean;
  vercelcron: vercelcrondata;
  customDayOfWeek: number[];
  customDayOfMonth: number[];
  customMonth: number[];

  setProvider: (v: string) => void;
  setModel: (v: string) => void;
  setProjectId: (v: string) => void;
  setsessionmessage: (v: chatsession[]) => void;
  setInput: (v: string) => void;
  setSending: (v: boolean) => void;
  setloadingfetch: (v: boolean) => void;
  setloadingerror: (v: boolean) => void;
  setNextCursor: (v: string | null) => void;
  setHasMore: (v: boolean) => void;
  setLoadingMore: (v: boolean) => void;
  setIsChecking: (v: boolean) => void;
  setLoadingdeletemsg: (v: boolean) => void;
  settype: (v: string | null) => void;
  setHover: (v: boolean) => void;
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
  setOpencron: (v: boolean) => void;
  setLoadingcroncreate: (v: boolean) => void;
  setVercelcron: (v: vercelcrondata) => void;
  setCustomDayOfWeek: (v: number[]) => void;
  setCustomDayOfMonth: (v: number[]) => void;
  setCustomMonth: (v: number[]) => void;

  resetvercel: () => void;
  updateSessionMessages: (updater: (prev: chatsession[]) => chatsession[]) => void;
}
