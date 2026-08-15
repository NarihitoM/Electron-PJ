import { useEffect, useRef, useState } from "react";
import { ArrowUp, ToolCaseIcon, Globe, X, Mic, Square } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { Spinner } from "@/shared/components/ui/spinner";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { toast } from "sonner";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useParams, useNavigate } from "react-router-dom";
import { getProviderModels } from "@/shared/config/providermodels";
import { chatauth } from "@/features/chat/api/api";
import { voiceauth } from "@/features/voice/api/api";
import { chatauthstore } from "../store/store";
import { useQueryClient } from "@tanstack/react-query";
import type { chatsession } from "@/shared/types/globaltype";
import type { chatfetch } from "../types/type";
import type { ModelEntry } from "@/shared/lib/modelsapi";

export const ChatInput = () => {
  const { data: Api = [] } = useServiceKeys();
  const store = chatauthstore();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [recordstatus, setrecordstatus] = useState(false);
  const [loadingrecord, setloadingrecord] = useState(false);
  const [modelList, setModelList] = useState<ModelEntry[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [hover, setHover] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSentInputRef = useRef("");

  useEffect(() => {
    if (!store.provider) {
      setModelList([]);
      return;
    }
    setModelsLoading(true);
    getProviderModels(store.provider)
      .then((models) => {
        setModelList(models);
        setModelsLoading(false);
        if (models.length > 0 && !models.some((m) => m.model === store.model)) {
          store.setModel(models[0].model);
        }
      })
      .catch((err) => {
        console.error("Failed to load models:", err);
        setModelList([]);
        setModelsLoading(false);
      });
  }, [store.provider]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const sendingRef = useRef(false);

  const handleSend = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      if (!store.input.trim() && store.pendingImages.length === 0) return;
    }

    if (
      (!store.input.trim() && store.pendingImages.length === 0) ||
      !store.provider ||
      !store.model
    )
      return;

    // Prevent double-send
    if (sendingRef.current) return;
    sendingRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    store.setSending(true);

    const currentInput = store.input;
    const currentImages = [...store.pendingImages];
    lastSentInputRef.current = currentInput;
    store.setInput("");
    store.setPendingImages([]);

    const blobUrls = currentImages.map((file) => URL.createObjectURL(file));
    const userMsg: chatsession = {
      role: "user",
      content: currentInput,
      images: blobUrls.length > 0 ? blobUrls : undefined,
    };
    store.updateSessionMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: "", provider: store.provider, model: store.model },
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
        store.setInput(currentInput);
        store.setPendingImages(currentImages);
        store.updateSessionMessages((prev) => prev.slice(0, -2));
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

    let chatId = id;
    const isNewChat = !chatId;
    let sendSuccess = false;
    if (!chatId) {
      try {
        const newChat = await chatauth.createchat();
        if (newChat.success && newChat.data) {
          chatId = newChat.data.id;
        } else {
          toast.error("Failed to create chat");
          store.setSending(false);
          return;
        }
      } catch {
        toast.error("Failed to create chat");
        store.setSending(false);
        return;
      }
    }

    // Optimistically set chat title from the first user message
    if (isNewChat && chatId) {
      const title = currentInput.length > 30 ? currentInput.substring(0, 30) + "..." : currentInput;
      queryClient.setQueryData(["chat"], (old: chatfetch[] | undefined) =>
        old?.map((c) => (c.id === chatId ? { ...c, title } : c)),
      );
    }

    try {
      await chatauth.sendmessage(
        chatId,
        store.provider,
        store.model,
        currentInput,
        store.type ?? "text",
        uploadedUrls.length > 0 ? uploadedUrls : undefined,
        store.reasoningLevel || undefined,
        (chunk: string, title?: string) => {
          store.updateSessionMessages((prev) => {
            const ns = [...prev];
            const li = ns.length - 1;
            if (ns[li]?.role === "assistant")
              ns[li] = { ...ns[li], content: ns[li].content + chunk };
            return ns;
          });
          if (title && chatId) {
            queryClient.setQueryData(["chat"], (old: chatfetch[] | undefined) =>
              old?.map((c) => (c.id === chatId ? { ...c, title } : c)),
            );
          }
        },
        (chunk: string) => {
          store.updateSessionMessages((prev) => {
            const ns = [...prev];
            const li = ns.length - 1;
            if (ns[li]?.role === "assistant") {
              ns[li] = { ...ns[li], thinking: (ns[li].thinking || "") + chunk };
            }
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
            if (status.step === "tool_start") {
              tc.push({
                id: status.id,
                name: status.tool ?? "Tool",
                query: (status as any).query ?? null,
                status: "loading" as const,
                result: null,
              });
            } else if (status.step === "tool_end") {
              const i = tc.findIndex((t) => t.id === status.id);
              if (i !== -1) tc[i] = { ...tc[i], status: "done" as const, result: status.result };
            } else if (status.step === "tool_error") {
              const i = tc.findIndex((t) => t.id === status.id);
              if (i !== -1) tc[i] = { ...tc[i], status: "error" as const, result: status.error };
            }
            ns[li] = { ...cm, toolsCall: tc };
            return ns;
          });
        },
        (data) => {
          const tc = data.tool_calls[0];
          if (tc) {
            store.threadIdRef.current = data.thread_id;
            store.pendingApprovalRef.current = { name: tc.name, query: tc.query ?? null };
            store.setPendingApproval({ name: tc.name, query: tc.query ?? null });
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
      );
      sendSuccess = true;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        if (abortControllerRef.current === controller) store.setInput(lastSentInputRef.current);
        return;
      }
      // Rollback optimistic messages on error
      store.updateSessionMessages((prev) => {
        // Remove the optimistic user msg + empty assistant msg we added
        const userIdx = prev.findIndex((m) => m.role === "user" && m.content === currentInput);
        if (userIdx !== -1) {
          const next = [...prev];
          // Remove user msg and the assistant placeholder after it
          next.splice(userIdx, 2);
          return next;
        }
        return prev;
      });
      // If it was a new chat with no messages sent, navigate back
      if (isNewChat && !chatId) {
        navigate(-1);
      }
      toast.error(err?.response?.data?.message || err?.message || "An unexpected error occurred.");
    } finally {
      sendingRef.current = false;
      if (abortControllerRef.current === controller) {
        store.setSending(false);
        abortControllerRef.current = null;
      }
      // Only navigate to new chat if send succeeded
      if (sendSuccess && !id && chatId) {
        navigate(`/chat/${chatId}`, { replace: true });
      }
      // Only invalidate queries if send succeeded (avoids creating empty chats)
      if (sendSuccess) {
        queryClient.invalidateQueries({ queryKey: ["message", id ?? chatId] });
        queryClient.invalidateQueries({ queryKey: ["chat"] });
        queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        queryClient.invalidateQueries({ queryKey: ["key"] });
        queryClient.invalidateQueries({ queryKey: ["creditBalance"], refetchType: "all" });
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const disabled = !store.model || !store.provider || loadingrecord || recordstatus;

  return (
    <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg overflow-visible">
      <ImagePreview
        images={store.pendingImages}
        onImagesChange={store.setPendingImages}
        uploading={store.uploadingImages}
      />
      <Textarea
        disabled={disabled}
        value={store.input}
        onChange={(e) => store.setInput(e.target.value)}
        placeholder={
          recordstatus ? "Listening..." : loadingrecord ? "Transcribing..." : "Message..."
        }
        onKeyDown={handleKeyDown}
        className="border-none max-h-50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
      />
      <div className="flex items-center justify-between mt-2 overflow-visible">
        <div className="flex gap-2 items-center">
          <ImagePicker
            images={store.pendingImages}
            onImagesChange={store.setPendingImages}
            uploading={store.uploadingImages}
            disabled={disabled}
            maxImages={4}
          />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="flex gap-1 items-center cursor-pointer">
                <ToolCaseIcon size={15} />
                <span className="text-sm">Tools</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuItem onClick={() => store.settype("websearch")}>
                <Globe /> Web search
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => store.settype("webscrape")}>
                <Globe /> Web Scrape
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {store.type === "websearch" && (
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
                <Globe size={17} className="text-blue-400" />
              )}
              <span className="text-[13px] text-blue-400">Search</span>
            </button>
          )}
          {store.type === "webscrape" && (
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
                <Globe size={17} className="text-blue-400" />
              )}
              <span className="text-[13px] text-blue-400">Scrape</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-visible">
          {Api.length > 0 && (
            <ModelSelect
              modelList={modelList}
              provider={store.provider || ""}
              model={store.model}
              loading={modelsLoading}
              disabled={!store.provider}
              onSelect={store.setModel}
              reasoningLevel={store.reasoningLevel}
              onReasoningLevelChange={store.setReasoningLevel}
            />
          )}
          <Button
            disabled={loadingrecord || !store.model || !store.provider}
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
              ((!store.input.trim() && store.pendingImages.length === 0) ||
                store.uploadingImages ||
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
            {store.sending ? <Square size={16} className="fill-current" /> : <ArrowUp size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
