import { useRef, useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { ArrowUp, Mic, Square, Settings, Bot } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useAgentNodes } from "@/features/agent/hooks/useAgentNodes";
import { useResetAgentMessages } from "@/features/agent/hooks/useResetAgentMessages";
import { useagentstore } from "../store/store";
import { useAgentMessages } from "../hooks/useAgentMessages";
import { useStoreAgentMessage } from "../hooks/useStoreAgentMessage";
import { voiceauth } from "@/features/voice/api/api";
import { AgentChatArea } from "./AgentChatArea";
import { useUser } from "@/features/auth/hooks/useUser";

export const AgentInput = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: nodesData } = useAgentNodes();
  const resetMsgMutation = useResetAgentMessages();
  const store = useagentstore();
  const { data: userdata } = useUser();
  const fetchAgentMessages = useAgentMessages();
  const { mutate: storeAgentMessage } = useStoreAgentMessage();
  const navigate = useNavigate();

  const agents = nodesData ?? [];

  // When the canvas has more than one Orchestrator node, only one graph can
  // run per message — the user picks which via the select below.
  const orchestratorNodes = agents.filter((n) => n.actor?.trim().toLowerCase() === "orchestrator");
  const activeOrchestratorId =
    orchestratorNodes.length > 1
      ? (store.activeOrchestratorId ?? orchestratorNodes[0]?.id ?? null)
      : null;

  useEffect(() => {
    if (orchestratorNodes.length <= 1) {
      if (store.activeOrchestratorId !== null) store.setActiveOrchestratorId(null);
      return;
    }
    if (!orchestratorNodes.some((n) => n.id === store.activeOrchestratorId)) {
      store.setActiveOrchestratorId(orchestratorNodes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orchestratorNodes.map((n) => n.id).join(",")]);

  // Exclude every Orchestrator node other than the selected one so the run
  // only ever targets one Orchestrator's graph.
  const otherOrchestratorIds = new Set(
    orchestratorNodes.filter((n) => n.id !== activeOrchestratorId).map((n) => n.id),
  );
  const runnableAgents = otherOrchestratorIds.size
    ? agents.filter((n) => !otherOrchestratorIds.has(n.id))
    : agents;

  // An Orchestrator node with no edges connecting it to any other node has
  // nothing to delegate to and would just error out if run.
  const orchestratorNode = runnableAgents.find(
    (n) => n.actor?.trim().toLowerCase() === "orchestrator",
  );
  const orchestratorNeedsSubagents =
    !!orchestratorNode &&
    !store.flowEdges.some(
      (e) => e.source === orchestratorNode.id || e.target === orchestratorNode.id,
    );

  const [recordstatus, setRecordstatus] = useState(false);
  const [loadingrecord, setLoadingrecord] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSentInputRef = useRef("");

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const onSendMessage = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      if (!store.input.trim()) return;
    }
    if (!store.input.trim() || store.messageloading) return;

    const hasOrchestrator = runnableAgents.some(
      (n) => n.actor?.trim().toLowerCase() === "orchestrator",
    );
    if (runnableAgents.length > 1 && !hasOrchestrator) {
      toast.info("No Orchestrator agent found", {
        description:
          'Add a node with Role set to "Orchestrator" to have it delegate to the other nodes automatically.',
      });
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const messageText = store.input;
    lastSentInputRef.current = messageText;
    // Capture the prior conversation before it's cleared below — the
    // workflow needs it as context (e.g. "add 2 to your previous answer").
    // Cap to the most recent exchanges so the context window isn't blown out.
    const priorHistory = store.history
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .slice(-20)
      .map((m: any) => ({ role: m.role, content: m.content }));
    store.setWorkflowloading(true);
    store.setMessageloading(true);
    store.setHistory([]);
    store.setLoopIteration({ current: 0, max: 0 });
    store.setNodes((prev) =>
      prev.map((n: any) => ({
        ...n,
        output: "",
        thinking: "",
        activeTool: null,
        status: "idle" as const,
      })),
    );
    store.workflowGenRef.current++;

    // With React Flow — the conversation is shared across all nodes
    store.updateHistory((prev) => [...prev, { role: "user", content: messageText, name: "" }]);
    storeAgentMessage({ role: "user", content: messageText, name: "" });

    const initialMessages: { role: string; content: string }[] = [
      ...priorHistory,
      { role: "user", content: messageText },
    ];

    // ── Compute execution order from React Flow edges ──
    // Edges are keyed by each node's real DB id (names can repeat), so the
    // graph algorithms below must match on id too, not name.
    const runEdges = otherOrchestratorIds.size
      ? store.flowEdges.filter(
          (e) => !otherOrchestratorIds.has(e.source) && !otherOrchestratorIds.has(e.target),
        )
      : store.flowEdges;
    const hasEdges = runEdges.length > 0;
    const isLoop =
      hasEdges &&
      hasCycle(
        runnableAgents.map((n) => n.id),
        runEdges,
      );
    let runningNodes: typeof runnableAgents;

    if (hasEdges && !isLoop) {
      // Topological sort: determine execution order from edge direction
      const sorted = topologicalSort(
        runnableAgents.map((n) => n.id),
        runEdges,
      );
      runningNodes = sorted
        .map((id) => runnableAgents.find((n) => n.id === id))
        .filter(Boolean) as typeof runnableAgents;
    } else {
      // No edges or loop = all nodes run simultaneously / continuous
      runningNodes = runnableAgents;
    }

    const useremail = userdata?.useremail ?? "";

    window.ipcRenderer.send("cancel-workflow");
    window.ipcRenderer.send("run-workflow", {
      input: initialMessages,
      nodes: runningNodes,
      encryptkey: Api,
      useremail,
      simultaneous: !hasEdges || isLoop,
      continuous: isLoop,
      edges: runEdges,
    });
    store.setInput("");
  };

  const onAbortWorkflow = () => {
    abortControllerRef.current?.abort();
    window.ipcRenderer.send("cancel-workflow");
    store.setWorkflowloading(false);
    store.setMessageloading(false);
    store.setLoopIteration({ current: 0, max: 0 });
    store.workflowGenRef.current++;
    store.setNodes((prev) =>
      prev.map((n: any) => ({ ...n, status: "idle" as const, activeTool: null })),
    );
  };

  const onResetHistory = async () => {
    try {
      await resetMsgMutation.mutateAsync(undefined);
      store.setHistory([]);
      toast.success("Chat history reset.");
    } catch {
      toast.error("Failed to reset history.");
    }
  };

  const onHistoryOpenChange = async (open: boolean) => {
    setHistoryOpen(open);
    if (open) {
      try {
        store.setLoadingfetch(true);
        const response = await fetchAgentMessages(undefined);
        if (response.success && response.data) {
          store.setHistory((response.data.messages ?? []).reverse());
          store.setNextCursor(response.data.nextCursor);
          store.setHasMore(response.data.hasMore);
        }
      } catch {
        toast.error("Failed to load history.");
      } finally {
        store.setLoadingfetch(false);
      }
    }
  };

  const startRecording = async () => {
    if (recordstatus) {
      stopRecording();
      return;
    }
    store.setInput("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    const audioChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      setRecordstatus(false);
      const form = new FormData();
      form.append("voice", audioBlob, "voice.webm");
      try {
        setLoadingrecord(true);
        const response = await voiceauth.sendvoice(form);
        if (response.transcribe) store.setInput(response.transcribe);
      } catch (err) {
        if (err instanceof Error) {
          const Error = err as any;
          toast.error(Error.response?.data?.message || err.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        setLoadingrecord(false);
      }
    };
    mediaRecorder.start();
    setRecordstatus(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive")
      mediaRecorderRef.current.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  return (
    <div className="w-full mx-auto max-w-5xl">
      {orchestratorNodes.length > 1 && (
        <div className="flex justify-end mb-2">
          <Select
            value={activeOrchestratorId ?? undefined}
            onValueChange={(val) => store.setActiveOrchestratorId(val ?? null)}
          >
            <SelectTrigger className="w-56" title="Choose which Orchestrator to run">
              <Bot className="w-4 h-4 text-cyan-500 dark:text-white shrink-0" />
              <span className="truncate">
                {orchestratorNodes.find((n) => n.id === activeOrchestratorId)?.name ??
                  "Choose Orchestrator"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {orchestratorNodes.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  <Bot className="w-4 h-4 text-cyan-500 dark:text-white shrink-0" />
                  {n.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="bg-card rounded-2xl border p-3 shadow-lg">
        <div className="relative flex flex-col">
          <Textarea
            disabled={agents.length === 0 || store.messageloading || loadingrecord || recordstatus}
            value={store.input}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !store.messageloading) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            onChange={(e) => store.setInput(e.target.value)}
            placeholder={
              recordstatus ? "Listening..." : loadingrecord ? "Transcribing..." : "Message..."
            }
            className="border-none max-h-50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
          {/* ── Recording / Working indicator ── */}
          {store.workflowloading && (
            <div className="flex items-center gap-2 px-1 py-1">
              <button
                onClick={onAbortWorkflow}
                className="group flex items-center gap-2 rounded-full bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                title="Click to stop"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                {store.loopIteration.max > 0
                  ? `Looping ${store.loopIteration.current}/${store.loopIteration.max} — Click to stop`
                  : "Working — Click to stop"}
              </button>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full"
                title="Service Settings"
                onClick={() => navigate("/app/settings")}
              >
                <Settings size={14} />
              </Button>
              <Sheet open={historyOpen} onOpenChange={onHistoryOpenChange}>
                <SheetTrigger asChild>
                  <Button className="bg-cyan-500 dark:bg-white rounded-full">History</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-125">
                  <SheetHeader>
                    <SheetTitle>
                      <div className="flex items-center gap-2">
                        Chat History
                        <Button
                          onClick={onResetHistory}
                          disabled={store.history.length === 0 || resetMsgMutation.isPending}
                          size="sm"
                          variant="destructive"
                          className="h-6 text-xs px-2"
                        >
                          {resetMsgMutation.isPending ? <Spinner /> : "Reset"}
                        </Button>
                      </div>
                    </SheetTitle>
                    <SheetDescription>
                      View your previous interactions with the agents.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 flex flex-col flex-1 min-h-0 overflow-hidden">
                    <AgentChatArea />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex gap-2 justify-end items-center">
              <Button
                disabled={loadingrecord || agents.length === 0}
                onClick={recordstatus ? stopRecording : startRecording}
                size="icon"
                className="bg-cyan-500 dark:bg-white rounded-full"
              >
                {recordstatus ? (
                  <Square size={14} className="fill-current" />
                ) : loadingrecord ? (
                  <Spinner />
                ) : (
                  <Mic size={14} />
                )}
              </Button>
              <Button
                onClick={store.workflowloading ? onAbortWorkflow : onSendMessage}
                size="icon"
                disabled={
                  !store.workflowloading &&
                  (!store.input ||
                    agents.length === 0 ||
                    orchestratorNeedsSubagents ||
                    store.messageloading ||
                    loadingrecord ||
                    recordstatus)
                }
                title={
                  orchestratorNeedsSubagents
                    ? "Connect a sub-agent to the Orchestrator node first"
                    : undefined
                }
                className={
                  store.workflowloading
                    ? "bg-red-500 hover:bg-red-600 rounded-full"
                    : "bg-cyan-500 dark:bg-white rounded-full"
                }
              >
                {store.workflowloading ? (
                  <Square size={16} className="fill-current" />
                ) : (
                  <ArrowUp size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Cycle detection — checks if edges contain a cycle (loop) ── */
function hasCycle(nodeNames: string[], edges: { source: string; target: string }[]): boolean {
  const adj = new Map<string, string[]>();
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Map<string, number>();

  for (const name of nodeNames) {
    adj.set(name, []);
    color.set(name, WHITE);
  }
  for (const edge of edges) {
    if (adj.has(edge.source)) {
      adj.get(edge.source)!.push(edge.target);
    }
  }

  const dfs = (node: string): boolean => {
    color.set(node, GRAY);
    for (const neighbor of adj.get(node) || []) {
      if (color.get(neighbor) === GRAY) return true; // back edge = cycle
      if (color.get(neighbor) === WHITE && dfs(neighbor)) return true;
    }
    color.set(node, BLACK);
    return false;
  };

  for (const name of nodeNames) {
    if (color.get(name) === WHITE && dfs(name)) return true;
  }
  return false;
}

/* ── Topological sort — determines execution order from edges ── */
function topologicalSort(
  nodeNames: string[],
  edges: { source: string; target: string }[],
): string[] {
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();

  for (const name of nodeNames) {
    adj.set(name, []);
    inDeg.set(name, 0);
  }

  for (const edge of edges) {
    if (adj.has(edge.source)) {
      adj.get(edge.source)!.push(edge.target);
    }
    inDeg.set(edge.target, (inDeg.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [name, deg] of inDeg) {
    if (deg === 0) queue.push(name);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const neighbor of adj.get(node) || []) {
      const newDeg = (inDeg.get(neighbor) || 1) - 1;
      inDeg.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return result;
}
