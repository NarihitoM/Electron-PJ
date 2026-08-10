import { useEffect, useRef, useState } from "react";
import { ArrowUp, Box, Mic, RefreshCw, Square, Timer, ToolCaseIcon, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { BRAND_SERVICE } from "@/shared/config/service";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { toast } from "sonner";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { getProviderModels } from "@/shared/config/providermodels";
import { chatauth } from "@/features/chat/api/api";
import { voiceauth } from "@/features/voice/api/api";
import { useGithubAccount } from "../hooks/useGithubAccount";
import { useSendGithubMessage } from "../hooks/useSendGithubMessage";
import { useDeleteGithubMessage } from "../hooks/useDeleteGithubMessage";
import { githubauthstore } from "../store/store";
import { GithubCronScheduler } from "./GithubCronScheduler";
import { useQueryClient } from "@tanstack/react-query";

export const GithubInput = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: githubAccount } = useGithubAccount();
  const store = githubauthstore();
  const sendGithubMessage = useSendGithubMessage();
  const { mutateAsync: deleteGithubMessage } = useDeleteGithubMessage();
  const queryClient = useQueryClient();

  const username = (githubAccount as any)?.username ?? "";
  const repos = (githubAccount as any)?.repos ?? [];
  const loadinggithub = !githubAccount;

  const [recordstatus, setrecordstatus] = useState(false);
  const [loadingrecord, setloadingrecord] = useState(false);
  const [hover, setHover] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSentInputRef = useRef("");

  const selectedReponame = repos.find((g: any) => g.full_name === store.repoid)?.full_name || "";

  useEffect(() => {
    if (!store.provider) {
      store.setModelList([]);
      return;
    }
    store.setModelsLoading(true);
    getProviderModels(store.provider).then((models) => {
      store.setModelList(models);
      store.setModelsLoading(false);
      if (models.length > 0 && !models.some((m: any) => m.model === store.model)) {
        store.setModel(models[0].model);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.provider]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const handleSend = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      if (!store.input.trim()) return;
    }
    if (!store.input.trim() || !store.provider || !store.model) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    store.setSending(true);

    const currentInput = store.input;
    const currentImages = [...store.pendingImages];
    lastSentInputRef.current = currentInput;
    store.setInput("");
    store.setPendingImages([]);

    const blobUrls = currentImages.map((file) => URL.createObjectURL(file));
    const userMsg = {
      role: "user" as const,
      content: currentInput,
      images: blobUrls.length > 0 ? blobUrls : undefined,
    };
    store.updateSessionMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant" as const, content: "", provider: store.provider, model: store.model },
    ]);

    if (blobUrls.length > 0) store.setUploadingImageUrls(new Set(blobUrls));

    let uploadedUrls: string[] = [];
    if (currentImages.length > 0) {
      store.setUploadingImages(true);
      try {
        uploadedUrls = await Promise.all(currentImages.map((file) => chatauth.uploadImage(file)));
      } catch {
        toast.error("Failed to upload images");
        store.setSending(false);
        store.setUploadingImages(false);
        store.setUploadingImageUrls(new Set());
        store.updateSessionMessages((prev) => prev.slice(0, -2));
        blobUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      store.setUploadingImages(false);
      store.setUploadingImageUrls(new Set());
      store.updateSessionMessages((prev) => {
        const newMsgs = [...prev];
        const idx = newMsgs.length - 2;
        if (idx >= 0 && newMsgs[idx].role === "user")
          newMsgs[idx] = { ...newMsgs[idx], images: uploadedUrls };
        return newMsgs;
      });
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    }

    try {
      await sendGithubMessage(
        currentInput,
        store.provider,
        store.model,
        store.repoid ?? "",
        username ?? "",
        store.type ?? "",
        uploadedUrls.length > 0 ? uploadedUrls : undefined,
        (chunk) => {
          store.updateSessionMessages((prev) => {
            const ns = [...prev];
            const li = ns.length - 1;
            if (ns[li]?.role === "assistant")
              ns[li] = { ...ns[li], content: ns[li].content + chunk };
            return ns;
          });
        },
        (chunk: string) => {
          store.updateSessionMessages((prev) => {
            const ns = [...prev];
            const li = ns.length - 1;
            if (ns[li]?.role === "assistant")
              ns[li] = { ...ns[li], thinking: (ns[li].thinking || "") + chunk };
            return ns;
          });
        },
        (status) => {
          store.updateSessionMessages((prev) => {
            const ns = [...prev];
            const li = ns.length - 1;
            if (ns[li]?.role !== "assistant") return prev;
            const cm = { ...ns[li] };
            const tc = [...(cm.toolsCall || [])];

            if ((status as any).type === "chain" && status.step === "start") {
              tc.push({
                id: status.id,
                name: (status as any).name ?? "Thinking",
                query: null,
                status: "loading" as const,
                result: null,
                isChain: true,
                input: (status as any).input,
              });
            } else if ((status as any).type === "chain" && status.step === "end") {
              const idx = tc.findIndex((t) => t.id === status.id);
              if (idx !== -1)
                tc[idx] = { ...tc[idx], status: "done" as const, output: (status as any).output };
            } else if (status.step === "tool_start") {
              tc.push({
                id: status.id,
                name: status.tool ?? "Tool",
                query: (status as any).query ?? null,
                status: "loading" as const,
                result: null,
              });
            } else if (status.step === "tool_end") {
              const i = tc.findIndex((t) => t.id === status.id);
              if (i !== -1)
                tc[i] = { ...tc[i], status: "done" as const, result: (status as any).result };
            } else if (status.step === "tool_error") {
              const i = tc.findIndex((t) => t.id === status.id);
              if (i !== -1)
                tc[i] = { ...tc[i], status: "error" as const, result: (status as any).error };
            }

            ns[li] = { ...cm, toolsCall: tc };
            return ns;
          });
        },
        (data) => {
          const toolCall = data.tool_calls[0];
          if (toolCall) {
            store.threadIdRef.current = data.thread_id;
            store.pendingApprovalRef.current = {
              name: toolCall.name,
              query: toolCall.query ?? null,
            };
            store.setPendingApproval({ name: toolCall.name, query: toolCall.query ?? null });
          }
        },
        (url: string) => {
          store.updateSessionMessages((prev) => {
            const nm = [...prev];
            const li = nm.length - 1;
            if (li >= 0 && nm[li].role === "assistant")
              nm[li] = { ...nm[li], generatedImages: [...(nm[li].generatedImages || []), url] };
            return nm;
          });
        },
        controller.signal,
        store.reasoningLevel || undefined,
      );
    } catch (err: any) {
      if (err?.name === "AbortError") {
        if (abortControllerRef.current === controller) store.setInput(lastSentInputRef.current);
        return;
      }
      toast.error(err?.response?.data?.message || err?.message || "An unexpected error occurred.");
    } finally {
      if (abortControllerRef.current === controller) {
        store.setSending(false);
        abortControllerRef.current = null;
      }
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  };

  const deletemessages = async () => {
    store.setloadinggithubmsg(true);
    try {
      const response = await deleteGithubMessage();
      if (response.success) {
        toast.success(response.message);
        store.setsessionmessage([]);
        store.setNextCursor(null);
        store.setHasMore(false);
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? (err as any).response?.data?.message || err.message
          : "An unexpected error occurred.";
      toast.error(errMsg);
    } finally {
      store.setloadinggithubmsg(false);
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
      setrecordstatus(false);
      const form = new FormData();
      form.append("voice", audioBlob, "voice.webm");
      try {
        setloadingrecord(true);
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
        setloadingrecord(false);
      }
    };
    mediaRecorder.start();
    setrecordstatus(true);
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
    <>
      <GithubCronScheduler />
      <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
        <div className="flex gap-2">
          <Button
            onClick={deletemessages}
            disabled={store.sessionmessage.length === 0 || store.loadinggithubmsg}
            className="bg-cyan-500 dark:bg-white"
          >
            {store.loadinggithubmsg ? (
              <Spinner />
            ) : (
              <>
                <RefreshCw />
                Reset Chat
              </>
            )}
          </Button>
          {username && (
            <Button onClick={() => store.setOpencron(true)} className="bg-cyan-500 dark:bg-white">
              <Timer />
              Schedule Task
            </Button>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {username && repos.length > 0 && (
            <Select
              value={store.repoid ?? undefined}
              onValueChange={(value) => store.setrepoid(value)}
              key={`${store.provider}-${store.type}`}
              disabled={!store.provider || loadinggithub}
            >
              <SelectTrigger>
                {store.repoid && (
                  <img src={BRAND_SERVICE["github"]} className="w-4 h-4 shrink-0 dark:invert" />
                )}
                <span className="truncate">
                  {store.repoid ? selectedReponame.substring(0, 15) + "..." : "Select Repos"}
                </span>
              </SelectTrigger>
              <SelectContent className="p-1 w-60">
                {repos.map((m: any) => (
                  <SelectItem key={m.id} value={m.full_name}>
                    <img src={BRAND_SERVICE["github"]} className="w-4 h-4 shrink-0 dark:invert" />
                    {m.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
        <ImagePreview
          images={store.pendingImages}
          onImagesChange={store.setPendingImages}
          uploading={store.uploadingImages}
        />
        <Textarea
          disabled={
            Api.length === 0 ||
            !username ||
            !store.model ||
            !store.provider ||
            loadingrecord ||
            recordstatus
          }
          value={store.input}
          onChange={(e) => store.setInput(e.target.value)}
          placeholder={
            recordstatus ? "Listening..." : loadingrecord ? "Transcribing..." : "Message..."
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="border-none max-h-50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2 items-center">
            <ImagePicker
              images={store.pendingImages}
              onImagesChange={store.setPendingImages}
              uploading={store.uploadingImages}
              disabled={
                Api.length === 0 ||
                !username ||
                !store.model ||
                !store.provider ||
                loadingrecord ||
                recordstatus
              }
              maxImages={4}
            />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="flex gap-1 items-center cursor-pointer">
                  <ToolCaseIcon size={15} />
                  <span className="text-sm">Tools</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-40">
                <DropdownMenuItem onClick={() => store.settype("listrepos")}>
                  <Box /> List Repos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype("listissues")}>
                  <Box /> List Issues
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype("createissue")}>
                  <Box /> Create Issue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype("commentissue")}>
                  <Box /> Comment Issue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype("listpullrequests")}>
                  <Box /> List Pull Requests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype("commitfile")}>
                  <Box /> Commit File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {store.type === "listrepos" && (
              <button
                onClick={() => {
                  store.settype("text");
                  setHover(false);
                }}
                disabled={store.sending}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
              >
                {hover ? (
                  <X size={17} className="text-blue-400" />
                ) : (
                  <Box size={17} className="text-blue-400" />
                )}
                <span className="text-[13px] text-blue-400">List Repos</span>
              </button>
            )}
            {store.type === "listissues" && (
              <button
                onClick={() => {
                  store.settype("text");
                  setHover(false);
                }}
                disabled={store.sending}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
              >
                {hover ? (
                  <X size={17} className="text-blue-400" />
                ) : (
                  <Box size={17} className="text-blue-400" />
                )}
                <span className="text-[13px] text-blue-400">List Issues</span>
              </button>
            )}
            {store.type === "createissue" && (
              <button
                onClick={() => {
                  store.settype("text");
                  setHover(false);
                }}
                disabled={store.sending}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
              >
                {hover ? (
                  <X size={17} className="text-blue-400" />
                ) : (
                  <Box size={17} className="text-blue-400" />
                )}
                <span className="text-[13px] text-blue-400">Create Issue</span>
              </button>
            )}
            {store.type === "commentissue" && (
              <button
                onClick={() => {
                  store.settype("text");
                  setHover(false);
                }}
                disabled={store.sending}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
              >
                {hover ? (
                  <X size={17} className="text-blue-400" />
                ) : (
                  <Box size={17} className="text-blue-400" />
                )}
                <span className="text-[13px] text-blue-400">Comment Issue</span>
              </button>
            )}
            {store.type === "listpullrequests" && (
              <button
                onClick={() => {
                  store.settype("text");
                  setHover(false);
                }}
                disabled={store.sending}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
              >
                {hover ? (
                  <X size={17} className="text-blue-400" />
                ) : (
                  <Box size={17} className="text-blue-400" />
                )}
                <span className="text-[13px] text-blue-400">List Pull Requests</span>
              </button>
            )}
            {store.type === "commitfile" && (
              <button
                onClick={() => {
                  store.settype("text");
                  setHover(false);
                }}
                disabled={store.sending}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
              >
                {hover ? (
                  <X size={17} className="text-blue-400" />
                ) : (
                  <Box size={17} className="text-blue-400" />
                )}
                <span className="text-[13px] text-blue-400">Commit File</span>
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {Api.length > 0 && (
              <ModelSelect
                modelList={store.modelList}
                provider={store.provider || ""}
                model={store.model}
                loading={store.modelsLoading}
                disabled={!store.provider}
                onSelect={store.setModel}
                reasoningLevel={store.reasoningLevel}
                onReasoningLevelChange={store.setReasoningLevel}
              />
            )}
            <Button
              disabled={loadingrecord || !username || !store.model || !store.provider}
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
              onClick={store.sending ? () => abortControllerRef.current?.abort() : handleSend}
              disabled={
                !store.sending &&
                (store.uploadingImages ||
                  !username ||
                  (!store.input.trim() && store.pendingImages.length === 0) ||
                  !store.model ||
                  !store.provider ||
                  loadingrecord ||
                  recordstatus)
              }
              size="icon"
              className={
                store.sending
                  ? "bg-red-500 hover:bg-red-600 rounded-full"
                  : "bg-cyan-500 dark:bg-white rounded-full"
              }
            >
              {store.sending ? (
                <Square size={16} className="fill-current" />
              ) : (
                <ArrowUp size={16} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
