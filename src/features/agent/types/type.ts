import type { nodes } from "@/shared/types/globaltype";
import type { ModelEntry } from "@/shared/lib/modelsapi";

export interface agentsession {
  id?: string;
  role: string;
  content: string;
  name: string;
  provider?: string;
  model?: string;
}

export interface agentpaginatedMessages {
  messages: agentsession[];
  nextCursor: string | null;
  hasMore: boolean;
}
export interface nodedata {
  id: string;
  name: string;
  provider: string;
  actor: string;
  model: string;
  tool: string;
  systemprompt: string;
}

export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
  key?: string;
}

export type returnnodefeedback = ApiResponse;
export type returnnodedata = ApiResponse<nodedata[]>;
export type returnagentmessagedata = ApiResponse<agentpaginatedMessages>;
export type returnagentmessagefeedback = ApiResponse;
export type returnedgedata = ApiResponse<FlowEdgeData[]>;
export type returnedgefeedback = ApiResponse;

export interface createAgent {
  //Data
  Node: nodedata[];

  //Loading
  loadingfetch: boolean;
  loadingnode: boolean;
  loadingresetmsg: boolean;

  type: string;
  settype: (type: string) => void;

  resetagent: () => void;
  //Functions
  addnode: (
    name: string,
    provider: string,
    actor: string,
    model: string,
    tool: string,
    prompt: string,
  ) => Promise<returnnodefeedback>;
  fetchnode: () => Promise<void>;
  updatenode: (
    nodeid: string,
    name: string,
    provider: string,
    actor: string,
    model: string,
    tool: string,
    prompt: string,
  ) => Promise<returnnodefeedback>;
  deletenode: (nodeid: string) => Promise<returnnodefeedback>;
  fetchagentmessages: (cursor?: string) => Promise<returnagentmessagedata>;
  storeagentmessage: (
    role: string,
    content: string,
    name: string,
    provider?: string,
    model?: string,
  ) => Promise<returnagentmessagefeedback>;
  resetagentmessages: () => Promise<returnagentmessagefeedback>;
}

export interface FlowEdgeData {
  id: string;
  source: string;
  target: string;
}

export interface AgentClientState {
  type: string;
  setType: (type: string) => void;
  resetagent: () => void;

  provider: string;
  model: string;
  setProvider: (v: string) => void;
  setModel: (v: string) => void;

  input: string;
  setInput: (v: string) => void;

  selectnode: string | null;
  setSelectnode: (v: string | null) => void;
  firstnode: string | null;
  setFirstnode: (v: string | null) => void;
  lastnode: string | null;
  setLastnode: (v: string | null) => void;

  messageloading: boolean;
  setMessageloading: (v: boolean) => void;
  workflowloading: boolean;
  setWorkflowloading: (v: boolean) => void;
  loopIteration: { current: number; max: number };
  setLoopIteration: (v: { current: number; max: number }) => void;

  history: agentsession[];
  setHistory: (v: agentsession[]) => void;
  loadingfetch: boolean;
  setLoadingfetch: (v: boolean) => void;
  loadingerror: boolean;
  setLoadingerror: (v: boolean) => void;
  nextCursor: string | null;
  setNextCursor: (v: string | null) => void;
  hasMore: boolean;
  setHasMore: (v: boolean) => void;
  loadingMore: boolean;
  setLoadingMore: (v: boolean) => void;

  nodes: nodes[];
  setNodes: (v: nodes[] | ((prev: nodes[]) => nodes[])) => void;

  modelList: ModelEntry[];
  setModelList: (v: ModelEntry[]) => void;
  modelsLoading: boolean;
  setModelsLoading: (v: boolean) => void;

  nodeDialogOpen: boolean;
  setNodeDialogOpen: (v: boolean) => void;
  nodeDialogMode: "create" | "update" | "delete";
  setNodeDialogMode: (v: "create" | "update" | "delete") => void;
  nodeid: string;
  setNodeid: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  actor: string;
  setActor: (v: string) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  tool: string | null;
  setTool: (v: string | null) => void;
  toolOpen: boolean;
  setToolOpen: (v: boolean) => void;
  providerOpen: boolean;
  setProviderOpen: (v: boolean) => void;
  modelOpen: boolean;
  setModelOpen: (v: boolean) => void;

  copiedIndex: number | null;
  setCopiedIndex: (v: number | null) => void;
  lightboxImages: string[];
  setLightboxImages: (v: string[]) => void;
  lightboxIndex: number;
  setLightboxIndex: (v: number) => void;
  lightboxOpen: boolean;
  setLightboxOpen: (v: boolean) => void;

  pendingImages: File[];
  setPendingImages: (v: File[]) => void;
  uploadingImages: boolean;
  setUploadingImages: (v: boolean) => void;
  uploadingImageUrls: Set<string>;
  setUploadingImageUrls: (v: Set<string>) => void;

  pendingToolApproval: { nodeName: string; toolName: string; args: Record<string, unknown> } | null;
  setPendingToolApproval: (
    v: { nodeName: string; toolName: string; args: Record<string, unknown> } | null,
  ) => void;

  topSentinelRef: { current: HTMLDivElement | null };
  scrollContainerRef: { current: HTMLDivElement | null };
  historyEndRef: { current: HTMLDivElement | null };
  workflowGenRef: { current: number };
  pendingApprovalRef: { current: { name: string; query: Record<string, unknown> | null } | null };
  threadIdRef: { current: string | null };

  recordstatus: boolean;
  setRecordstatus: (v: boolean) => void;
  loadingrecord: boolean;
  setLoadingrecord: (v: boolean) => void;

  /** React Flow edges — defines execution order between agent nodes */
  flowEdges: FlowEdgeData[];
  setFlowEdges: (edges: FlowEdgeData[]) => void;
  /** Persisted node positions for React Flow (keyed by node name) */
  nodePositions: Record<string, { x: number; y: number }>;
  setNodePositions: (positions: Record<string, { x: number; y: number }>) => void;

  /** Edge the user clicked "+" on — the next created node gets spliced into this edge */
  pendingEdgeInsert: { edgeId: string; source: string; target: string } | null;
  setPendingEdgeInsert: (v: { edgeId: string; source: string; target: string } | null) => void;

  /** Which Orchestrator node's graph to run, when the canvas has more than one */
  activeOrchestratorId: string | null;
  setActiveOrchestratorId: (v: string | null) => void;

  resetForm: () => void;
  updateHistory: (updater: (prev: agentsession[]) => agentsession[]) => void;
  updateSessionMessages: (updater: (prev: agentsession[]) => agentsession[]) => void;
}
