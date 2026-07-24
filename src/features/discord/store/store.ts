import { create } from "zustand";
import type { chatsession } from "@/shared/types/globaltype";
import type { DiscordClientState } from "../types/type";

export const discordauthstore = create<DiscordClientState>((set, get) => ({
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
  channelid: "",
  loadingdiscorddelmsg: false,
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
  setChannelid: (channelid) => set({ channelid }),
  setLoadingdiscorddelmsg: (loadingdiscorddelmsg) => set({ loadingdiscorddelmsg }),
  resetdiscord: () => set({ provider: "", model: "", selectedChannelId: "" }),
}));
