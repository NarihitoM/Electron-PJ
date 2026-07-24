import { chatsession } from "../../../shared/types/globaltype";

export interface discordacc {
  guildId: string;
  guildName?: string;
}

export interface Apiresponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export type returndiscordacc = Apiresponse<discordacc>;
export type returndiscordfeedback = Apiresponse;
export type returndiscordmsg = Apiresponse<{
  messages: chatsession[];
  nextCursor: string | null;
  hasMore: boolean;
}>;

export interface DiscordClientState {
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
  channelid: string;
  loadingdiscorddelmsg: boolean;
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
  setChannelid: (v: string) => void;
  setLoadingdiscorddelmsg: (v: boolean) => void;
  resetdiscord: () => void;
}

export interface creatediscord {
  loadingdiscord: boolean;
  loadingdiscorddelete: boolean;
  loadingdiscorddelmsg: boolean;

  guildId: string | null;
  guildName: string | null;
  provider: string;
  model: string;
  setModel: (model: string) => void;
  setProvider: (provider: string) => void;

  resetdiscord: () => void;
  fetchdiscordacc: () => Promise<void>;
  fetchdiscordmessage: (cursor?: string, limit?: number) => Promise<returndiscordmsg>;
  deletediscordmsg: () => Promise<returndiscordfeedback>;
  deletediscordservice: () => Promise<returndiscordfeedback>;
  senddiscordmessage: (
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
}
