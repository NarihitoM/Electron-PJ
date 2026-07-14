import { chatsession } from "../../../shared/types/globaltype";
import type { ModelEntry } from "@/shared/lib/modelsapi";

export interface googledata {
  id: string;
  name: string;
  url: string;
}

export interface google {
  serviceemail: string;
  googlesheet: googledata[];
  googledocs: googledata[];
}

export interface Apiresponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export type returngooglefeedback = Apiresponse<google>;
export type returngooglefetchmessage = Apiresponse<{
  messages: chatsession[];
  nextCursor: string | null;
  hasMore: boolean;
}>;

export interface GoogleClientState {
  provider: string;
  model: string;
  sheeturl: string;
  docsurl: string;

  // Docs fields
  sessionmessage_docs: chatsession[];
  input_docs: string;
  sending_docs: boolean;
  loadingfetch_docs: boolean;
  loadingerror_docs: boolean;
  nextCursor_docs: string | null;
  hasMore_docs: boolean;
  loadingMore_docs: boolean;
  type_docs: string | null;
  opendocs: boolean;
  openservice: boolean;
  useremail_docs: string;
  key_docs: string;
  docsinput: string;
  lightboxImages_docs: string[];
  lightboxIndex_docs: number;
  lightboxOpen_docs: boolean;
  copiedIndex_docs: number | null;
  uploadingImages_docs: boolean;
  uploadingImageUrls_docs: Set<string>;
  pendingImages_docs: File[];
  modelList_docs: { model: string; name: string }[];
  modelsLoading_docs: boolean;
  reasoningLevel_docs: "" | "low" | "medium" | "high";
  recordstatus_docs: boolean;
  loadingrecord_docs: boolean;
  pendingApproval: { name: string; query: Record<string, unknown> | null } | null;
  pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
  threadIdRef: { current: string | null };
  setsessionmessage_docs: (messages: chatsession[]) => void;
  setInput_docs: (input: string) => void;
  setSending_docs: (v: boolean) => void;
  setloadingfetch_docs: (v: boolean) => void;
  setloadingerror_docs: (v: boolean) => void;
  setNextCursor_docs: (v: string | null) => void;
  setHasMore_docs: (v: boolean) => void;
  setLoadingMore_docs: (v: boolean) => void;
  settype_docs: (v: string | null) => void;
  setOpendocs: (v: boolean) => void;
  setOpenservice: (v: boolean) => void;
  setUseremail_docs: (v: string) => void;
  setKey_docs: (v: string) => void;
  setDocsinput: (v: string) => void;
  setLightboxImages_docs: (v: string[]) => void;
  setLightboxIndex_docs: (v: number) => void;
  setLightboxOpen_docs: (v: boolean) => void;
  setCopiedIndex_docs: (v: number | null) => void;
  setUploadingImages_docs: (v: boolean) => void;
  setUploadingImageUrls_docs: (v: Set<string>) => void;
  setPendingImages_docs: (v: File[]) => void;
  setModelList_docs: (v: { model: string; name: string }[]) => void;
  setModelsLoading_docs: (v: boolean) => void;
  setReasoningLevel_docs: (level: "" | "low" | "medium" | "high") => void;
  setRecordstatus_docs: (v: boolean) => void;
  setLoadingrecord_docs: (v: boolean) => void;
  setPendingApproval: (v: { name: string; query: Record<string, unknown> | null } | null) => void;
  updateSessionMessages_docs: (updater: (prev: chatsession[]) => chatsession[]) => void;

  // Sheet fields
  sessionmessage_sheet: chatsession[];
  input_sheet: string;
  sending_sheet: boolean;
  loadingfetch_sheet: boolean;
  loadingerror_sheet: boolean;
  nextCursor_sheet: string | null;
  hasMore_sheet: boolean;
  loadingMore_sheet: boolean;
  type_sheet: string | null;
  hover_sheet: boolean;
  opensheet: boolean;
  useremail_sheet: string;
  key_sheet: string;
  sheetinput: string;
  pendingApproval_sheet: { name: string; query: Record<string, unknown> | null } | null;
  pendingApprovalRef_sheet: {
    current: { name: string; query: Record<string, unknown> | null } | null;
  };
  threadIdRef_sheet: { current: string | null };
  lightboxImages_sheet: string[];
  lightboxIndex_sheet: number;
  lightboxOpen_sheet: boolean;
  copiedIndex_sheet: number | null;
  uploadingImages_sheet: boolean;
  uploadingImageUrls_sheet: Set<string>;
  pendingImages_sheet: File[];
  modelList_sheet: ModelEntry[];
  modelsLoading_sheet: boolean;
  reasoningLevel_sheet: "" | "low" | "medium" | "high";
  recordstatus_sheet: boolean;
  loadingrecord_sheet: boolean;

  setsheeturl: (url: string) => void;
  setdocsurl: (url: string) => void;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  resetgoogle: () => void;

  setsessionmessage_sheet: (messages: chatsession[]) => void;
  setInput_sheet: (input: string) => void;
  setSending_sheet: (v: boolean) => void;
  setloadingfetch_sheet: (v: boolean) => void;
  setloadingerror_sheet: (v: boolean) => void;
  setNextCursor_sheet: (v: string | null) => void;
  setHasMore_sheet: (v: boolean) => void;
  setLoadingMore_sheet: (v: boolean) => void;
  settype_sheet: (v: string | null) => void;
  setHover_sheet: (v: boolean) => void;
  setOpensheet: (v: boolean) => void;
  setuseremail_sheet: (v: string) => void;
  setkey_sheet: (v: string) => void;
  setsheetinput: (v: string) => void;
  setPendingApproval_sheet: (
    v: { name: string; query: Record<string, unknown> | null } | null,
  ) => void;
  setLightboxImages_sheet: (v: string[]) => void;
  setLightboxIndex_sheet: (v: number) => void;
  setLightboxOpen_sheet: (v: boolean) => void;
  setCopiedIndex_sheet: (v: number | null) => void;
  setUploadingImages_sheet: (v: boolean) => void;
  setUploadingImageUrls_sheet: (v: Set<string>) => void;
  setPendingImages_sheet: (v: File[]) => void;
  setModelList_sheet: (v: ModelEntry[]) => void;
  setModelsLoading_sheet: (v: boolean) => void;
  setReasoningLevel_sheet: (level: "" | "low" | "medium" | "high") => void;
  setrecordstatus_sheet: (v: boolean) => void;
  setloadingrecord_sheet: (v: boolean) => void;
  updateSessionMessages_sheet: (updater: (prev: chatsession[]) => chatsession[]) => void;
}

export interface creategoogle {
  loading: boolean;
  loadingfetch: boolean;
  loadingsheet: boolean;
  loadingdocs: boolean;
  loadinggoogleservicedelete: boolean;
  loadingsheetdelete: boolean;
  loadingdocsdelete: boolean;

  provider: string;
  model: string;
  sheeturl: string;
  docsurl: string;
  sheet: googledata[];
  docs: googledata[];
  serviceemail: string | null;

  setsheeturl: (url: string) => void;
  setdocsurl: (url: string) => void;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;

  resetgoogle: () => void;

  addgoogleservice: (serviceemail: string, servicekey: string) => Promise<returngooglefeedback>;
  addgooglesheet: (sheeturl: string) => Promise<returngooglefeedback>;
  addgoogledocs: (docsurl: string) => Promise<returngooglefeedback>;
  fetchgoogleservice: () => Promise<void>;
  deletegoogleservice: () => Promise<returngooglefeedback>;
  deletesheetmsg: () => Promise<returngooglefeedback>;
  deletedocsmsg: () => Promise<returngooglefeedback>;
  fetchsheetmessage: (cursor?: string, limit?: number) => Promise<returngooglefetchmessage>;
  fetchdocsmessage: (cursor?: string, limit?: number) => Promise<returngooglefetchmessage>;
  sendsheetmessage: (
    content: string,
    provider: string,
    model: string,
    url: string,
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
  senddocsmessage: (
    content: string,
    provider: string,
    model: string,
    url: string,
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
