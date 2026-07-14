import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { ArrowUp, ToolCaseIcon, X, Square, Mic, Box } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useGoogleService } from "@/features/google/hooks/useGoogleService";
import { getProviderModels } from "@/shared/config/providermodels";
import { googleauthstore } from "../store/store";
import { googleauth } from "../api/api";
import { chatauth } from "@/features/chat/api/api";
import { voiceauth } from "@/features/voice/api/api";
import { useQueryClient } from "@tanstack/react-query";
import type { chatsession } from "@/shared/types/globaltype";
import type { ModelEntry } from "@/shared/lib/modelsapi";

export const GoogleDocsInput = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: googleService } = useGoogleService();
  const store = googleauthstore();
  const queryClient = useQueryClient();

  const serviceemail = (googleService as any)?.email ?? "";
  const docs = (googleService as any)?.googledocs ?? [];

  const [recordstatus, setrecordstatus] = useState(false);
  const [loadingrecord, setloadingrecord] = useState(false);
  const [modelList, setModelList] = useState<ModelEntry[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

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
    getProviderModels(store.provider).then((models) => {
      setModelList(models);
      setModelsLoading(false);
      if (models.length > 0 && !models.some((m) => m.model === store.model)) {
        store.setModel(models[0].model);
      }
    });
  }, [store.provider]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const handleSend = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      if (!store.input_docs.trim() && store.pendingImages_docs.length === 0) return;
    }

    if (
      (!store.input_docs.trim() && store.pendingImages_docs.length === 0) ||
      !store.provider ||
      !store.model ||
      store.uploadingImages_docs ||
      !store.docsurl
    )
      return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    store.setSending_docs(true);

    const currentInput = store.input_docs;
    const currentImages = [...store.pendingImages_docs];
    lastSentInputRef.current = currentInput;
    store.setInput_docs("");
    store.setPendingImages_docs([]);

    const blobUrls = currentImages.map((file) => URL.createObjectURL(file));
    const userMsg: chatsession = {
      role: "user",
      content: currentInput,
      images: blobUrls.length > 0 ? blobUrls : undefined,
    };
    store.updateSessionMessages_docs((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: "", provider: store.provider, model: store.model },
    ]);

    if (blobUrls.length > 0) {
      store.setUploadingImageUrls_docs(new Set(blobUrls));
    }

    let uploadedUrls: string[] = [];
    if (currentImages.length > 0) {
      store.setUploadingImages_docs(true);
      try {
        uploadedUrls = await Promise.all(currentImages.map((file) => chatauth.uploadImage(file)));
      } catch {
        toast.error("Failed to upload images");
        store.setSending_docs(false);
        store.setUploadingImages_docs(false);
        store.setUploadingImageUrls_docs(new Set());
        store.updateSessionMessages_docs((prev) => prev.slice(0, -2));
        return;
      }
      store.setUploadingImages_docs(false);
      store.setUploadingImageUrls_docs(new Set());
      store.updateSessionMessages_docs((prev) => {
        const newMsgs = [...prev];
        const userMsgIdx = newMsgs.length - 2;
        if (userMsgIdx >= 0 && newMsgs[userMsgIdx].role === "user") {
          newMsgs[userMsgIdx] = { ...newMsgs[userMsgIdx], images: uploadedUrls };
        }
        return newMsgs;
      });
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    }

    try {
      await googleauth.senddocsmessage(
        currentInput,
        store.provider,
        store.model,
        store.docsurl ?? "",
        store.type_docs ?? "",
        uploadedUrls.length > 0 ? uploadedUrls : undefined,
        (chunk) => {
          store.updateSessionMessages_docs((prev) => {
            const newSession = [...prev];
            const lastIndex = newSession.length - 1;
            if (newSession[lastIndex]?.role === "assistant") {
              newSession[lastIndex] = {
                ...newSession[lastIndex],
                content: newSession[lastIndex].content + chunk,
              };
            }
            return newSession;
          });
        },
        (chunk: string) => {
          store.updateSessionMessages_docs((prev) => {
            const newSession = [...prev];
            const lastIndex = newSession.length - 1;
            if (newSession[lastIndex]?.role === "assistant") {
              newSession[lastIndex] = {
                ...newSession[lastIndex],
                thinking: (newSession[lastIndex].thinking || "") + chunk,
              };
            }
            return newSession;
          });
        },
        (status) => {
          store.updateSessionMessages_docs((prev) => {
            const newSession = [...prev];
            const lastIndex = newSession.length - 1;
            if (newSession[lastIndex]?.role !== "assistant") return prev;
            const currentMessage = { ...newSession[lastIndex] };
            const toolCalls = [...(currentMessage.toolsCall || [])];

            if (status.type === "chain" && status.step === "start") {
              toolCalls.push({
                id: status.id,
                name: status.name ?? "Thinking",
                query: null,
                status: "loading",
                result: null,
                isChain: true,
                input: status.input,
              });
            } else if (status.type === "chain" && status.step === "end") {
              const idx = toolCalls.findIndex((t) => t.id === status.id);
              if (idx !== -1) {
                toolCalls[idx] = { ...toolCalls[idx], status: "done", output: status.output };
              }
            } else if (status.step === "tool_start") {
              toolCalls.push({
                id: status.id,
                name: status.tool ?? "Tool",
                query: (status as any).query ?? null,
                status: "loading",
                result: null,
              });
            } else if (status.step === "tool_end") {
              const toolIndex = toolCalls.findIndex((t) => t.id === status.id);
              if (toolIndex !== -1) {
                toolCalls[toolIndex] = {
                  ...toolCalls[toolIndex],
                  status: "done",
                  result: status.result,
                };
              }
            } else if (status.step === "tool_error") {
              const toolIndex = toolCalls.findIndex((t) => t.id === status.id);
              if (toolIndex !== -1) {
                toolCalls[toolIndex] = {
                  ...toolCalls[toolIndex],
                  status: "error",
                  result: status.error,
                };
              }
            }

            newSession[lastIndex] = { ...currentMessage, toolsCall: toolCalls };
            return newSession;
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
        (url) => {
          store.updateSessionMessages_docs((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
              const current = newMessages[lastIndex];
              newMessages[lastIndex] = {
                ...current,
                generatedImages: [...(current.generatedImages || []), url],
              };
            }
            return newMessages;
          });
        },
        controller.signal,
        store.reasoningLevel_docs || undefined,
      );
    } catch (err) {
      if ((err as any)?.name === "AbortError") {
        if (abortControllerRef.current === controller) {
          store.setInput_docs(lastSentInputRef.current);
        }
        return;
      }
      if (err instanceof Error) {
        const error = (err as any).response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        store.setSending_docs(false);
        abortControllerRef.current = null;
      }
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["creditBalance"], refetchType: "all" });
    }
  };

  const deleteDocsMessage = async () => {
    try {
      const response = await googleauth.deletedocsmsg();
      if (response.success) {
        toast.success(response.message);
        store.setsessionmessage_docs([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const error = (err as any).response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const startRecording = async () => {
    if (recordstatus) {
      stopRecording();
      return;
    }
    store.setInput_docs("");
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
        if (response.transcribe) {
          store.setInput_docs(response.transcribe);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          const error = (err as any).response?.data?.message || err.message;
          toast.error(error);
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const isDisabled =
    Api.length === 0 ||
    !store.provider ||
    !store.model ||
    !serviceemail ||
    docs.length === 0 ||
    loadingrecord ||
    recordstatus ||
    store.uploadingImages_docs;

  const toolLabels: Record<string, string> = {
    read: "Read Docs Data",
    edit: "Edit Docs Data",
    delete: "Delete Docs File",
  };

  return (
    <>
      <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
        <Button
          onClick={deleteDocsMessage}
          disabled={store.sessionmessage_docs.length === 0}
          className="bg-cyan-500 dark:bg-white"
        >
          {
            <>
              <svg
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 2v6H3V2M3 8l1.5 14h15L21 8M10 12v4M14 12v4M7.5 2L9 4h6l1.5-2" />
              </svg>
              Reset Chat
            </>
          }
        </Button>
      </div>
      <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
        <ImagePreview
          images={store.pendingImages_docs}
          onImagesChange={store.setPendingImages_docs}
          uploading={store.uploadingImages_docs}
        />
        <Textarea
          disabled={isDisabled}
          value={store.input_docs}
          onChange={(e) => store.setInput_docs(e.target.value)}
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
              images={store.pendingImages_docs}
              onImagesChange={store.setPendingImages_docs}
              uploading={store.uploadingImages_docs}
              disabled={isDisabled}
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
                <DropdownMenuItem onClick={() => store.settype_docs("read")}>
                  <Box /> Read Docs Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_docs("edit")}>
                  <Box /> Edit Docs Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_docs("delete")}>
                  <Box /> Delete Docs File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_docs("create")}>
                  <Box /> Create Docs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {store.type_docs && store.type_docs !== "text" && store.type_docs !== "create" && (
              <button
                onClick={() => {
                  store.settype_docs("text");
                }}
                disabled={store.sending_docs}
                className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
              >
                <X size={17} className="text-blue-400" />
                <span className="text-[13px] text-blue-400">
                  {toolLabels[store.type_docs] || store.type_docs}
                </span>
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {Api.length > 0 && (
              <ModelSelect
                modelList={modelList}
                provider={store.provider || ""}
                model={store.model}
                loading={modelsLoading}
                disabled={!store.provider}
                onSelect={store.setModel}
                reasoningLevel={store.reasoningLevel_docs}
                onReasoningLevelChange={store.setReasoningLevel_docs}
              />
            )}
            <Button
              disabled={
                loadingrecord ||
                !serviceemail ||
                docs.length === 0 ||
                !store.model ||
                !store.provider
              }
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
              onClick={store.sending_docs ? () => abortControllerRef.current?.abort() : handleSend}
              disabled={
                !store.sending_docs &&
                (!serviceemail ||
                  !store.provider ||
                  !store.model ||
                  (!store.input_docs.trim() && store.pendingImages_docs.length === 0) ||
                  docs.length === 0 ||
                  loadingrecord ||
                  recordstatus ||
                  store.uploadingImages_docs)
              }
              size="icon"
              className={
                store.sending_docs
                  ? "bg-red-500 hover:bg-red-600 rounded-full"
                  : "bg-cyan-500 dark:bg-white rounded-full"
              }
            >
              {store.sending_docs ? (
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
