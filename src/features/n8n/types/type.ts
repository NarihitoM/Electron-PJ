import { chatsession } from "../../../shared/types/globaltype";

export interface N8nClientState {
  provider: string;
  model: string;
  sessionmessage: chatsession[];
  input: string;
  sending: boolean;
  reasoningLevel: "" | "low" | "medium" | "high";
  pendingImages: File[];
  uploadingImages: boolean;
  uploadingImageUrls: Set<string>;

  loadingfetch: boolean;
  loadingerror: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  type: string | null;
  hover: boolean;

  settingsOpen: boolean;
  urlInput: string;
  authTypeInput: string;
  authValueInput: string;
  testingMode: boolean;
  testResult: { restApiAvailable: boolean; mode: string } | null;

  lightboxImages: string[];
  lightboxIndex: number;
  lightboxOpen: boolean;
  copiedIndex: number | null;

  pendingApproval: { name: string; query: Record<string, unknown> | null } | null;

  opencron: boolean;
  loadingcroncreate: boolean;
  n8ncron: n8ncrondata;
  customDayOfWeek: number[];
  customDayOfMonth: number[];
  customMonth: number[];
  setOpencron: (v: boolean) => void;
  setLoadingcroncreate: (v: boolean) => void;
  setN8ncron: (v: n8ncrondata) => void;
  setCustomDayOfWeek: (v: number[]) => void;
  setCustomDayOfMonth: (v: number[]) => void;
  setCustomMonth: (v: number[]) => void;

  abortControllerRef: { current: AbortController | null };
  lastSentInputRef: { current: string };
  messagesEndRef: { current: HTMLDivElement | null };
  pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
  threadIdRef: { current: string | null };
  topSentinelRef: { current: HTMLDivElement | null };
  scrollContainerRef: { current: HTMLDivElement | null };

  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setsessionmessage: (messages: chatsession[]) => void;
  setInput: (input: string) => void;
  setSending: (v: boolean) => void;
  setReasoningLevel: (level: "" | "low" | "medium" | "high") => void;
  setPendingImages: (images: File[]) => void;
  setUploadingImages: (v: boolean) => void;
  setUploadingImageUrls: (v: Set<string>) => void;
  setloadingfetch: (v: boolean) => void;
  setloadingerror: (v: boolean) => void;
  setNextCursor: (v: string | null) => void;
  setHasMore: (v: boolean) => void;
  setLoadingMore: (v: boolean) => void;
  settype: (v: string | null) => void;
  setHover: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  setUrlInput: (v: string) => void;
  setAuthTypeInput: (v: string) => void;
  setAuthValueInput: (v: string) => void;
  setTestingMode: (v: boolean) => void;
  setTestResult: (v: { restApiAvailable: boolean; mode: string } | null) => void;
  setLightboxImages: (v: string[]) => void;
  setLightboxIndex: (v: number) => void;
  setLightboxOpen: (v: boolean) => void;
  setCopiedIndex: (v: number | null) => void;
  setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;

  resetSending: () => void;
  scrollToBottom: () => void;
  updateSessionMessages: (updater: (prev: chatsession[]) => chatsession[]) => void;
}

export interface N8nConfig {
  n8nUrl: string;
  n8nApiKey: string;
  connected: boolean;
  authType?: string;
  hasAuth?: boolean;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  finishedAt: string;
}

export interface returnn8nconfig {
  success: boolean;
  data: N8nConfig;
}

export interface returnn8nmsg {
  success: boolean;
  data: {
    messages: Array<{
      role: string;
      content: string;
      provider?: string;
      model?: string;
      toolsCall?: any[];
      id?: string;
    }>;
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface returnn8nfeedback {
  success: boolean;
  message: string;
  authType?: string;
}

export interface returnn8ntest {
  success: boolean;
  data: {
    restApiAvailable: boolean;
    error?: string;
    mode: string;
  };
}

export interface n8ncrondata {
  isActive: boolean;
  model: string;
  provider: string;
  message: string;
  crontype: string;
  triggerAt: string;
  timezone: string;
  customSchedule?: string;
}

export interface returnn8ncrondata {
  success: boolean;
  message?: string;
  data?: n8ncrondata;
}
