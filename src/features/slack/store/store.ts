import { create } from "zustand";
import type { chatsession } from "@/shared/types/globaltype";
import type { slackcrondata, SlackClientState } from "../types/type";

const initialSlackCron: slackcrondata = {
  isActive: false,
  channel: "",
  roomId: "",
  workspace: "",
  model: "",
  provider: "",
  message: "",
  crontype: "",
  triggerAt: "",
  timezone: "",
  customSchedule: "",
};

export const slackauthstore = create<SlackClientState>((set, get) => ({
  provider: "",
  model: "",
  selectedChannelId: "",
  sessionmessage: [],
  sending: false,
  pendingApproval: null,
  pendingApprovalRef: { current: null },
  threadIdRef: { current: null },
  lightboxImages: [],
  lightboxIndex: 0,
  lightboxOpen: false,
  uploadingImages: false,
  uploadingImageUrls: new Set(),
  isChecking: false,
  nextCursor: null,
  hasMore: false,
  mode: "",
  channelid: null,
  loadingslackdelmsg: false,
  opencron: false,
  slackcron: initialSlackCron,
  loadingcroncreate: false,
  cronModelList: [],
  modelOpen: false,
  customDayOfWeek: [],
  customDayOfMonth: [],
  customMonth: [],
  setProvider: (provider) => set({ provider, model: "" }),
  setModel: (model) => set({ model }),
  setSelectedChannelId: (selectedChannelId) => set({ selectedChannelId }),
  setsessionmessage: (v) =>
    set({
      sessionmessage:
        typeof v === "function"
          ? (v as (prev: chatsession[]) => chatsession[])(get().sessionmessage)
          : v,
    }),
  setSending: (sending) => set({ sending }),
  setPendingApproval: (pendingApproval) => set({ pendingApproval }),
  setLightboxImages: (lightboxImages) => set({ lightboxImages }),
  setLightboxIndex: (lightboxIndex) => set({ lightboxIndex }),
  setLightboxOpen: (lightboxOpen) => set({ lightboxOpen }),
  setUploadingImages: (uploadingImages) => set({ uploadingImages }),
  setUploadingImageUrls: (v) =>
    set({
      uploadingImageUrls:
        typeof v === "function"
          ? (v as (prev: Set<string>) => Set<string>)(get().uploadingImageUrls)
          : v,
    }),
  setIsChecking: (isChecking) => set({ isChecking }),
  setNextCursor: (nextCursor) => set({ nextCursor }),
  setHasMore: (hasMore) => set({ hasMore }),
  setMode: (mode) => set({ mode }),
  setChannelid: (channelid) => set({ channelid }),
  setLoadingslackdelmsg: (loadingslackdelmsg) => set({ loadingslackdelmsg }),
  setOpencron: (opencron) => set({ opencron }),
  setSlackcron: (v) =>
    set({
      slackcron:
        typeof v === "function"
          ? (v as (prev: slackcrondata) => slackcrondata)(get().slackcron)
          : v,
    }),
  setLoadingcroncreate: (loadingcroncreate) => set({ loadingcroncreate }),
  setCronModelList: (cronModelList) => set({ cronModelList }),
  setModelOpen: (modelOpen) => set({ modelOpen }),
  setCustomDayOfWeek: (customDayOfWeek) => set({ customDayOfWeek }),
  setCustomDayOfMonth: (customDayOfMonth) => set({ customDayOfMonth }),
  setCustomMonth: (customMonth) => set({ customMonth }),
  resetslack: () => set({ provider: "", model: "", selectedChannelId: "" }),
}));
