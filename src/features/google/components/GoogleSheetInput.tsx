import { useEffect, useRef } from "react";
import { ArrowUp, Mic, Square, Box, Timer, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
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
import { GoogleSheetCronScheduler } from "./GoogleSheetCronScheduler";

export const GoogleSheetInput = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: googleService } = useGoogleService();
  const store = googleauthstore();
  const queryClient = useQueryClient();

  const serviceemail = (googleService as any)?.email ?? "";
  const sheet = (googleService as any)?.googlesheet ?? [];

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSentInputRef = useRef("");

  useEffect(() => {
    if (!store.provider) {
      store.setModelList_sheet([]);
      return;
    }
    store.setModelsLoading_sheet(true);
    getProviderModels(store.provider).then((models) => {
      store.setModelList_sheet(models);
      store.setModelsLoading_sheet(false);
      if (models.length > 0 && !models.some((m) => m.model === store.model)) {
        store.setModel(models[0].model);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.provider]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const handleSend = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      if (!store.input_sheet.trim()) return;
    }

    if (
      (!store.input_sheet.trim() && store.pendingImages_sheet.length === 0) ||
      !store.provider ||
      !store.model ||
      store.uploadingImages_sheet ||
      !store.sheeturl
    )
      return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    store.setSending_sheet(true);

    const currentInput = store.input_sheet;
    const currentImages = [...store.pendingImages_sheet];
    lastSentInputRef.current = currentInput;
    store.setInput_sheet("");
    store.setPendingImages_sheet([]);

    const blobUrls = currentImages.map((file) => URL.createObjectURL(file));

    const userMsg = {
      role: "user" as const,
      content: currentInput,
      images: blobUrls.length > 0 ? blobUrls : undefined,
    };
    store.updateSessionMessages_sheet((prev) => [
      ...prev,
      userMsg,
      { role: "assistant" as const, content: "", provider: store.provider, model: store.model },
    ]);

    if (blobUrls.length > 0) {
      store.setUploadingImageUrls_sheet(new Set(blobUrls));
    }

    let uploadedUrls: string[] = [];
    if (currentImages.length > 0) {
      store.setUploadingImages_sheet(true);
      try {
        uploadedUrls = await Promise.all(currentImages.map((file) => chatauth.uploadImage(file)));
      } catch (err) {
        toast.error("Failed to upload images");
        store.setSending_sheet(false);
        store.setUploadingImages_sheet(false);
        store.setUploadingImageUrls_sheet(new Set());
        store.updateSessionMessages_sheet((prev) => prev.slice(0, -2));
        return;
      }
      store.setUploadingImages_sheet(false);
      store.setUploadingImageUrls_sheet(new Set());

      store.updateSessionMessages_sheet((prev) => {
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
      await googleauth.sendsheetmessage(
        currentInput,
        store.provider,
        store.model,
        store.sheeturl ?? "",
        store.type_sheet ?? "",
        uploadedUrls.length > 0 ? uploadedUrls : undefined,
        (data) => {
          store.updateSessionMessages_sheet((prev) => {
            const newSession = [...prev];
            const lastIndex = newSession.length - 1;
            if (newSession[lastIndex]?.role === "assistant") {
              newSession[lastIndex] = {
                ...newSession[lastIndex],
                content: newSession[lastIndex].content + data,
              };
            }
            return newSession;
          });
        },
        (chunk: string) => {
          store.updateSessionMessages_sheet((prev) => {
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
        (status: any) => {
          store.updateSessionMessages_sheet((prev) => {
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
              const idx = toolCalls.findIndex((t: any) => t.id === status.id);
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
              const toolIndex = toolCalls.findIndex((t: any) => t.id === status.id);
              if (toolIndex !== -1) {
                toolCalls[toolIndex] = {
                  ...toolCalls[toolIndex],
                  status: "done",
                  result: status.result,
                };
              }
            } else if (status.step === "tool_error") {
              const toolIndex = toolCalls.findIndex((t: any) => t.id === status.id);
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
        (data: {
          thread_id: string;
          tool_calls: Array<{ id: string; name: string; query: Record<string, unknown> }>;
        }) => {
          const toolCall = data.tool_calls[0];
          if (toolCall) {
            store.threadIdRef_sheet.current = data.thread_id;
            store.pendingApprovalRef_sheet.current = {
              name: toolCall.name,
              query: toolCall.query ?? null,
            };
            store.setPendingApproval_sheet({ name: toolCall.name, query: toolCall.query ?? null });
          }
        },
        (url: string) => {
          store.updateSessionMessages_sheet((prev) => {
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
        store.reasoningLevel_sheet || undefined,
      );
    } catch (err) {
      if ((err as any)?.name === "AbortError") {
        if (abortControllerRef.current === controller) {
          store.setInput_sheet(lastSentInputRef.current);
        }
        return;
      }
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        store.setSending_sheet(false);
        abortControllerRef.current = null;
      }
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["creditBalance"], refetchType: "all" });
    }
  };

  const startRecording = async () => {
    if (store.recordstatus_sheet) {
      stopRecording();
      return;
    }

    store.setInput_sheet("");

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
      store.setrecordstatus_sheet(false);

      const form = new FormData();
      form.append("voice", audioBlob, "voice.webm");

      try {
        store.setloadingrecord_sheet(true);
        const response = await voiceauth.sendvoice(form);
        if (response.transcribe) {
          store.setInput_sheet(response.transcribe);
        }
      } catch (err) {
        if (err instanceof Error) {
          const Error = err as any;
          toast.error(Error.response?.data?.message || err.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        store.setloadingrecord_sheet(false);
      }
    };

    mediaRecorder.start();
    store.setrecordstatus_sheet(true);
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
    sheet.length === 0 ||
    store.loadingrecord_sheet ||
    store.recordstatus_sheet ||
    store.uploadingImages_sheet;

  const renderTypeBadge = () => {
    const labels: Record<string, string> = {
      read: "Read Sheet Data",
      edit: "Edit Sheet Data",
      append: "Append Sheet Data",
      delete: "Delete Sheet Data",
    };
    if (!store.type_sheet || !labels[store.type_sheet]) return null;
    return (
      <button
        onClick={() => {
          store.settype_sheet("text");
          store.setHover_sheet(false);
        }}
        disabled={store.sending_sheet}
        onMouseEnter={() => store.setHover_sheet(true)}
        onMouseLeave={() => store.setHover_sheet(false)}
        className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
      >
        {store.hover_sheet ? (
          <X size={17} className="text-blue-400" />
        ) : (
          <Box size={17} className="text-blue-400" />
        )}
        <span className="text-[13px] text-blue-400">{labels[store.type_sheet]}</span>
      </button>
    );
  };

  return (
    <>
      <GoogleSheetCronScheduler />
      {serviceemail && (
        <div className="flex w-full gap-2 mx-auto max-w-5xl mb-3">
          <Button
            onClick={() => store.setOpensheetcron(true)}
            className="bg-cyan-500 dark:bg-white"
          >
            <Timer />
            Schedule Task
          </Button>
        </div>
      )}
      <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
        <ImagePreview
          images={store.pendingImages_sheet}
          onImagesChange={store.setPendingImages_sheet}
          uploading={store.uploadingImages_sheet}
        />
        <Textarea
          disabled={isDisabled}
          value={store.input_sheet}
          onChange={(e) => store.setInput_sheet(e.target.value)}
          placeholder={
            store.recordstatus_sheet
              ? "Listening..."
              : store.loadingrecord_sheet
                ? "Transcribing..."
                : "Message..."
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
              images={store.pendingImages_sheet}
              onImagesChange={store.setPendingImages_sheet}
              uploading={store.uploadingImages_sheet}
              disabled={isDisabled}
              maxImages={4}
            />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="flex gap-1 items-center cursor-pointer">
                  <span className="text-sm">Tools</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" side="top" className="w-45">
                <DropdownMenuItem onClick={() => store.settype_sheet("read")}>
                  <Box /> Read Sheet Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_sheet("edit")}>
                  <Box /> Edit Sheet Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_sheet("delete")}>
                  <Box /> Delete Sheet Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_sheet("append")}>
                  <Box /> Append Sheet Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_sheet("create")}>
                  <Box /> Create Sheet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_sheet("addsheet")}>
                  <Box /> Add Sheet Tab
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {renderTypeBadge()}
          </div>
          <div className="flex gap-2">
            {Api.length > 0 && (
              <ModelSelect
                modelList={store.modelList_sheet}
                provider={store.provider || ""}
                model={store.model}
                loading={store.modelsLoading_sheet}
                disabled={!store.provider}
                onSelect={store.setModel}
                reasoningLevel={store.reasoningLevel_sheet}
                onReasoningLevelChange={store.setReasoningLevel_sheet}
              />
            )}
            <Button
              disabled={
                store.loadingrecord_sheet ||
                !serviceemail ||
                sheet.length === 0 ||
                !store.model ||
                !store.provider
              }
              onClick={store.recordstatus_sheet ? stopRecording : startRecording}
              size="icon"
              className="bg-cyan-500 dark:bg-white rounded-full"
            >
              {store.recordstatus_sheet ? (
                <Square size={14} className="fill-current" />
              ) : store.loadingrecord_sheet ? (
                <Spinner />
              ) : (
                <Mic size={14} />
              )}
            </Button>
            <Button
              onClick={store.sending_sheet ? () => abortControllerRef.current?.abort() : handleSend}
              disabled={
                !store.sending_sheet &&
                (!store.provider ||
                  !store.model ||
                  (!store.input_sheet.trim() && store.pendingImages_sheet.length === 0) ||
                  sheet.length === 0 ||
                  store.loadingrecord_sheet ||
                  store.recordstatus_sheet ||
                  store.uploadingImages_sheet)
              }
              size="icon"
              className={
                store.sending_sheet
                  ? "bg-red-500 hover:bg-red-600 rounded-full"
                  : "bg-cyan-500 dark:bg-white rounded-full"
              }
            >
              {store.sending_sheet ? (
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
