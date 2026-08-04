import { create } from "zustand";
import type { N8nClientState, n8ncrondata } from "../types/type";

export const initialN8nCron: n8ncrondata = {
  isActive: false,
  model: "",
  provider: "",
  message: "",
  crontype: "minute",
  triggerAt: "09:00",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  customSchedule: "",
};

export const n8nauthstore = create<N8nClientState>((set, get) => ({
  provider: "",
  model: "",
  sessionmessage: [],
  input: "",
  sending: false,
  reasoningLevel: "",
  pendingImages: [],
  uploadingImages: false,
  uploadingImageUrls: new Set(),

  loadingfetch: false,
  loadingerror: false,
  nextCursor: null,
  hasMore: false,
  loadingMore: false,
  type: "text",
  hover: false,

  settingsOpen: false,
  urlInput: "",
  authTypeInput: "cookie",
  authValueInput: "",
  testingMode: false,
  testResult: null,

  lightboxImages: [],
  lightboxIndex: 0,
  lightboxOpen: false,
  copiedIndex: null,

  pendingApproval: null,

  opencron: false,
  loadingcroncreate: false,
  n8ncron: { ...initialN8nCron },
  customDayOfWeek: [],
  customDayOfMonth: [],
  customMonth: [],

  abortControllerRef: { current: null },
  lastSentInputRef: { current: "" },
  messagesEndRef: { current: null },
  pendingApprovalRef: { current: null },
  threadIdRef: { current: null },
  topSentinelRef: { current: null },
  scrollContainerRef: { current: null },

  setProvider: (provider) => set({ provider, model: "" }),
  setModel: (model) => set({ model }),
  setsessionmessage: (messages) => set({ sessionmessage: messages }),
  setInput: (input) => set({ input }),
  setSending: (v) => set({ sending: v }),
  setReasoningLevel: (reasoningLevel) => set({ reasoningLevel }),
  setPendingImages: (pendingImages) => set({ pendingImages }),
  setUploadingImages: (v) => set({ uploadingImages: v }),
  setUploadingImageUrls: (v) => set({ uploadingImageUrls: v }),
  setloadingfetch: (v) => set({ loadingfetch: v }),
  setloadingerror: (v) => set({ loadingerror: v }),
  setNextCursor: (v) => set({ nextCursor: v }),
  setHasMore: (v) => set({ hasMore: v }),
  setLoadingMore: (v) => set({ loadingMore: v }),
  settype: (v) => set({ type: v }),
  setHover: (v) => set({ hover: v }),
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  setUrlInput: (v) => set({ urlInput: v }),
  setAuthTypeInput: (v) => set({ authTypeInput: v }),
  setAuthValueInput: (v) => set({ authValueInput: v }),
  setTestingMode: (v) => set({ testingMode: v }),
  setTestResult: (v) => set({ testResult: v }),
  setLightboxImages: (v) => set({ lightboxImages: v }),
  setLightboxIndex: (v) => set({ lightboxIndex: v }),
  setLightboxOpen: (v) => set({ lightboxOpen: v }),
  setCopiedIndex: (v) => set({ copiedIndex: v }),
  setPendingApproval: (v) => set({ pendingApproval: v }),

  setOpencron: (v) => set({ opencron: v }),
  setLoadingcroncreate: (v) => set({ loadingcroncreate: v }),
  setN8ncron: (v) => set({ n8ncron: v }),
  setCustomDayOfWeek: (v) => set({ customDayOfWeek: v }),
  setCustomDayOfMonth: (v) => set({ customDayOfMonth: v }),
  setCustomMonth: (v) => set({ customMonth: v }),

  resetSending: () => set({ sending: false }),
  scrollToBottom: () => {
    const el = get().messagesEndRef.current;
    el?.scrollIntoView({ behavior: "auto" });
  },
  updateSessionMessages: (updater) =>
    set((state) => ({ sessionmessage: updater(state.sessionmessage) })),
}));
