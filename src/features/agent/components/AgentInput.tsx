import { useRef, useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { ArrowUp, Mic, Square, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { toast } from "sonner";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useAgentNodes } from "@/features/agent/hooks/useAgentNodes";
import { useResetAgentMessages } from "@/features/agent/hooks/useResetAgentMessages";
import { useagentstore } from "../store/store";
import { agentauth } from "../api/api";
import { voiceauth } from "@/features/voice/api/api";
import { AgentChatArea } from "./AgentChatArea";
import { useUser } from "@/features/auth/hooks/useUser";
import { useEmailCreds } from "@/features/email/hooks/useEmailCreds";
import { useSaveEmailCreds } from "@/features/email/hooks/useSaveEmailCreds";
import { useRemoveEmailCreds } from "@/features/email/hooks/useRemoveEmailCreds";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { CheckCircle2, XCircle, Mail, Eye, EyeOff } from "lucide-react";

export const AgentInput = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: nodesData } = useAgentNodes();
  const resetMsgMutation = useResetAgentMessages();
  const store = useagentstore();
  const { data: userdata } = useUser();

  const agents = nodesData ?? [];

  const [recordstatus, setRecordstatus] = useState(false);
  const [loadingrecord, setLoadingrecord] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSentInputRef = useRef("");

  // Email service state
  const { data: emailCreds, isLoading: loadingEmail } = useEmailCreds();
  const saveEmailCreds = useSaveEmailCreds();
  const removeEmailCreds = useRemoveEmailCreds();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailHost, setEmailHost] = useState("");
  const [emailPort, setEmailPort] = useState("587");
  const [emailUser, setEmailUser] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [showEmailPass, setShowEmailPass] = useState(false);

  useEffect(() => {
    if (emailCreds?.exists && emailCreds?.data) {
      setEmailHost(emailCreds.data.smtp_host);
      setEmailPort(String(emailCreds.data.smtp_port));
      setEmailUser(emailCreds.data.smtp_user);
      setEmailPass(emailCreds.data.smtp_pass);
    }
  }, [emailCreds]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const onSendMessage = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      if (!store.input.trim()) return;
    }
    if (!store.input.trim() || store.messageloading) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const messageText = store.input;
    lastSentInputRef.current = messageText;
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
    agentauth.storeagentmessage("user", messageText, "").catch(() => {});

    const initialMessages: { role: string; content: string }[] = [
      { role: "user", content: messageText },
    ];

    // ── Compute execution order from React Flow edges ──
    // Edges are keyed by each node's real DB id (names can repeat), so the
    // graph algorithms below must match on id too, not name.
    const hasEdges = store.flowEdges.length > 0;
    const isLoop =
      hasEdges &&
      hasCycle(
        agents.map((n) => n.id),
        store.flowEdges,
      );
    let runningNodes: typeof agents;

    if (hasEdges && !isLoop) {
      // Topological sort: determine execution order from edge direction
      const sorted = topologicalSort(
        agents.map((n) => n.id),
        store.flowEdges,
      );
      runningNodes = sorted
        .map((id) => agents.find((n) => n.id === id))
        .filter(Boolean) as typeof agents;
    } else {
      // No edges or loop = all nodes run simultaneously / continuous
      runningNodes = agents;
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
        const response = await agentauth.fetchagentmessages(undefined);
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
              <Sheet open={store.servicesOpen} onOpenChange={store.setServicesOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" className="bg-cyan-500 dark:bg-white rounded-full">
                    <Settings size={14} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-100 sm:w-135 overflow-y-auto">
                  <SheetHeader className="px-5 pt-5">
                    <SheetTitle>Services</SheetTitle>
                    <SheetDescription>
                      Configure external services for your MultiAgents.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="px-5 mt-6 space-y-6">
                    {/* ── Integrations ── */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Integrations
                      </h3>
                      <div className="rounded-lg border p-3">
                        {/* Email */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Email (SMTP)</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {loadingEmail
                                  ? "Checking..."
                                  : emailCreds?.exists
                                    ? `Connected: ${emailCreds.data?.smtp_user}`
                                    : "Not configured"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {emailCreds?.exists ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowEmailForm(!showEmailForm)}
                              className="whitespace-nowrap"
                            >
                              {emailCreds?.exists ? "Edit" : "Configure"}
                            </Button>
                            {emailCreds?.exists && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await removeEmailCreds.mutateAsync();
                                    toast.success("Email credentials removed.");
                                    setShowEmailForm(false);
                                  } catch {
                                    toast.error("Failed to remove email credentials.");
                                  }
                                }}
                                disabled={removeEmailCreds.isPending}
                                className="whitespace-nowrap"
                              >
                                {removeEmailCreds.isPending ? <Spinner /> : "Disconnect"}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Email form */}
                        {showEmailForm && (
                          <div className="mt-4 space-y-3 border-t pt-4">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2 flex flex-col gap-1">
                                <Label className="text-xs">SMTP Host</Label>
                                <Input
                                  placeholder="smtp.gmail.com"
                                  value={emailHost}
                                  onChange={(e) => setEmailHost(e.target.value)}
                                  className="h-9 text-sm"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <Label className="text-xs">Port</Label>
                                <Input
                                  placeholder="587"
                                  value={emailPort}
                                  onChange={(e) => setEmailPort(e.target.value)}
                                  className="h-9 text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label className="text-xs">Email / Username</Label>
                              <Input
                                placeholder="user@gmail.com"
                                value={emailUser}
                                onChange={(e) => setEmailUser(e.target.value)}
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label className="text-xs">Password</Label>
                              <div className="relative">
                                <Input
                                  type={showEmailPass ? "text" : "password"}
                                  placeholder="App password"
                                  value={emailPass}
                                  onChange={(e) => setEmailPass(e.target.value)}
                                  className="h-9 text-sm pr-9"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowEmailPass(!showEmailPass)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showEmailPass ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-cyan-500 dark:bg-white w-full"
                              onClick={async () => {
                                if (!emailHost || !emailPort || !emailUser || !emailPass) {
                                  toast.error("All fields are required.");
                                  return;
                                }
                                try {
                                  await saveEmailCreds.mutateAsync({
                                    smtp_host: emailHost,
                                    smtp_port: parseInt(emailPort, 10) || 587,
                                    smtp_user: emailUser,
                                    smtp_pass: emailPass,
                                  });
                                  toast.success("Email credentials saved.");
                                  setShowEmailForm(false);
                                } catch {
                                  toast.error("Failed to save email credentials.");
                                }
                              }}
                              disabled={saveEmailCreds.isPending}
                            >
                              {saveEmailCreds.isPending ? <Spinner /> : "Save"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
                    store.messageloading ||
                    loadingrecord ||
                    recordstatus)
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
