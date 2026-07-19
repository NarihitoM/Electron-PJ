import { useRef, useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { ArrowUp, Mic, Square, Settings, BotIcon } from "lucide-react";
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

    const isSpecificNode = store.type === "Specific Node" && !!store.selectnode;
    const messageNodeName = isSpecificNode ? (store.selectnode as string) : "";

    store.updateHistory((prev) => [
      ...prev,
      { role: "user", content: messageText, name: messageNodeName },
    ]);
    agentauth.storeagentmessage("user", messageText, messageNodeName).catch(() => {});

    // Give the target node its own prior history instead of starting from scratch each turn.
    let initialMessages: { role: string; content: string }[] = [];
    if (isSpecificNode) {
      try {
        const historyResp = await agentauth.fetchagentmessages(undefined, store.selectnode!);
        initialMessages = (historyResp.data?.messages ?? [])
          .reverse()
          .map((m) => ({ role: m.role, content: m.content }));
      } catch {
        // Fall back to sending just the new message if history can't be fetched.
      }
    }
    initialMessages.push({ role: "user", content: messageText });

    const selectedNode = agents.find((n) => n.name === store.selectnode);
    const runningNodes = selectedNode ? [selectedNode] : agents.length > 0 ? [agents[0]] : [];
    const useremail = userdata?.useremail ?? "";

    window.ipcRenderer.send("cancel-workflow");
    window.ipcRenderer.send("run-workflow", {
      input: initialMessages,
      nodes: runningNodes,
      encryptkey: Api,
      useremail,
      firstnode: store.firstnode,
      lastnode: store.lastnode,
      targetnode: store.selectnode,
      simultaneous: false,
    });
    store.setInput("");
  };

  const onAbortWorkflow = () => {
    abortControllerRef.current?.abort();
    window.ipcRenderer.send("cancel-workflow");
    store.setWorkflowloading(false);
    store.setMessageloading(false);
    store.workflowGenRef.current++;
    store.setNodes((prev) =>
      prev.map((n: any) => ({ ...n, status: "idle" as const, activeTool: null })),
    );
  };

  const isSpecificNode = store.type === "Specific Node" && !!store.selectnode;

  const onResetHistory = async () => {
    try {
      await resetMsgMutation.mutateAsync(isSpecificNode ? store.selectnode! : undefined);
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
        const response = await agentauth.fetchagentmessages(
          undefined,
          isSpecificNode ? store.selectnode! : undefined,
        );
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
      <div className="flex items-center justify-end gap-2 mb-2 flex-wrap px-1">
        <Select onValueChange={(val) => store.setType(val ?? "")} value={store.type}>
          <SelectTrigger className="w-40">
            <span className="truncate">
              {store.type ? store.type.substring(0, 15) + "..." : "Select Mode"}
            </span>
          </SelectTrigger>
          <SelectContent side="top" align="end" className="p-1 w-60">
            <SelectItem value="Linear Sequence">Linear Sequence</SelectItem>
            <SelectItem value="Specific Node">Specific Node</SelectItem>
            <SelectItem value="Range Node">Range Node</SelectItem>
            <SelectItem value="Simultaneous">Simultaneous</SelectItem>
          </SelectContent>
        </Select>
        {store.type === "Specific Node" && (
          <Select
            onValueChange={(val) => val && store.setSelectnode(val)}
            value={store.selectnode ?? ""}
            disabled={!store.type}
          >
            <SelectTrigger className="w-44">
              <span className="truncate">
                {store.selectnode ? store.selectnode.substring(0, 15) + "..." : "Select Agent Node"}
              </span>
            </SelectTrigger>
            <SelectContent className="p-1 w-60">
              {agents.map((n: any) => (
                <SelectItem key={n.id} value={n.name}>
                  {n.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {store.type === "Range Node" &&
          (agents.length > 1 ? (
            <div className="flex gap-2">
              <Select
                onValueChange={(val) => val && store.setFirstnode(val)}
                value={store.firstnode ?? ""}
                disabled={!store.type}
              >
                <SelectTrigger className="w-44">
                  <span className="truncate">
                    {store.firstnode ? store.firstnode.substring(0, 15) + "..." : "First Node"}
                  </span>
                </SelectTrigger>
                <SelectContent className="p-1 w-60">
                  {agents.map((n: any) => (
                    <SelectItem key={n.id} value={n.name}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(val) => val && store.setLastnode(val)}
                value={store.lastnode ?? ""}
                disabled={!store.type}
              >
                <SelectTrigger className="w-44">
                  <span className="truncate">
                    {store.lastnode ? store.lastnode.substring(0, 15) + "..." : "Last Node"}
                  </span>
                </SelectTrigger>
                <SelectContent className="p-1 w-60">
                  {agents.map((n: any) => (
                    <SelectItem key={n.id} value={n.name}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <span className="text-sm text-red-400">Add at least two nodes.</span>
          ))}
      </div>
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
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Sheet open={store.servicesOpen} onOpenChange={store.setServicesOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" className="bg-cyan-500 dark:bg-white rounded-full">
                    <Settings size={14} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-100 sm:w-135">
                  <SheetHeader>
                    <SheetTitle>Services</SheetTitle>
                    <SheetDescription>
                      Configure external services for your MultiAgents.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {Api.length === 0 ? (
                      <p>No services configured. Add API keys in Settings to enable services.</p>
                    ) : (
                      <ul className="space-y-2">
                        {Api.map((s: any) => (
                          <li
                            key={s.provider}
                            className="flex items-center gap-2 p-2 rounded-lg border"
                          >
                            <span className="font-medium">{s.provider}</span>
                          </li>
                        ))}
                      </ul>
                    )}
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
              {store.type === "Specific Node" && store.selectnode && (
                <div className="inline-flex gap-2 items-center p-1.5 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20">
                  <span className="text-sm flex items-center gap-2">
                    {store.selectnode}
                    <BotIcon size={18} />
                  </span>
                </div>
              )}
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
                  (!store.type ||
                    !store.input ||
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
