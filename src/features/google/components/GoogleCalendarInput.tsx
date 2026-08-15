import { useEffect, useMemo, useRef } from "react";
import { ArrowUp, Mic, Square, Box, X, RefreshCw, ToolCaseIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useGoogleService } from "@/features/google/hooks/useGoogleService";
import { useGoogleConnect } from "@/features/google/hooks/useGoogleConnect";
import { useSendGoogleCalendarMessage } from "@/features/google/hooks/useSendGoogleCalendarMessage";
import { useDeleteGoogleCalendarMessage } from "@/features/google/hooks/useDeleteGoogleCalendarMessage";
import { getProviderModels } from "@/shared/config/providermodels";
import { googleauthstore } from "../store/store";
import { chatauth } from "@/features/chat/api/api";
import { voiceauth } from "@/features/voice/api/api";
import { useQueryClient } from "@tanstack/react-query";

export const GoogleCalendarInput = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: googleService } = useGoogleService();
  const store = googleauthstore();
  const queryClient = useQueryClient();
  const { connect, isChecking } = useGoogleConnect();
  const sendCalendarMessage = useSendGoogleCalendarMessage();
  const { mutateAsync: deleteCalendarMessage, isPending: loadingcalendardelete } =
    useDeleteGoogleCalendarMessage();

  const serviceemail = (googleService as any)?.serviceemail ?? "";
  const calendars = useMemo(() => (googleService as any)?.googlecalendar ?? [], [googleService]);

  const selectedCalendarTitle = useMemo(() => {
    return (
      calendars.find((c: any) => c.calendarId === store.calendarid)?.name ||
      (store.calendarid === "primary" ? "Primary Calendar" : "")
    );
  }, [store.calendarid, calendars]);

  const connectGoogle = async () => {
    try {
      await connect();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const calendarmsgdelete = async () => {
    try {
      const response = await deleteCalendarMessage();
      if (response.success) {
        toast.success(response.message);
        store.setsessionmessage_calendar([]);
        store.setNextCursor_calendar(null);
        store.setHasMore_calendar(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSentInputRef = useRef("");

  useEffect(() => {
    if (!store.provider) {
      store.setModelList_calendar([]);
      return;
    }
    store.setModelsLoading_calendar(true);
    getProviderModels(store.provider).then((models) => {
      store.setModelList_calendar(models);
      store.setModelsLoading_calendar(false);
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
      if (!store.input_calendar.trim()) return;
    }

    if (
      (!store.input_calendar.trim() && store.pendingImages_calendar.length === 0) ||
      !store.provider ||
      !store.model ||
      store.uploadingImages_calendar
    )
      return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    store.setSending_calendar(true);

    const currentInput = store.input_calendar;
    const currentImages = [...store.pendingImages_calendar];
    lastSentInputRef.current = currentInput;
    store.setInput_calendar("");
    store.setPendingImages_calendar([]);

    const blobUrls = currentImages.map((file) => URL.createObjectURL(file));

    const userMsg = {
      role: "user" as const,
      content: currentInput,
      images: blobUrls.length > 0 ? blobUrls : undefined,
    };
    store.updateSessionMessages_calendar((prev) => [
      ...prev,
      userMsg,
      { role: "assistant" as const, content: "", provider: store.provider, model: store.model },
    ]);

    if (blobUrls.length > 0) {
      store.setUploadingImageUrls_calendar(new Set(blobUrls));
    }

    let uploadedUrls: string[] = [];
    if (currentImages.length > 0) {
      store.setUploadingImages_calendar(true);
      try {
        uploadedUrls = await Promise.all(currentImages.map((file) => chatauth.uploadImage(file)));
      } catch (err) {
        toast.error("Failed to upload images");
        store.setSending_calendar(false);
        store.setUploadingImages_calendar(false);
        store.setUploadingImageUrls_calendar(new Set());
        store.setInput_calendar(currentInput);
        store.setPendingImages_calendar(currentImages);
        store.updateSessionMessages_calendar((prev) => prev.slice(0, -2));
        return;
      }
      store.setUploadingImages_calendar(false);
      store.setUploadingImageUrls_calendar(new Set());

      store.updateSessionMessages_calendar((prev) => {
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
      await sendCalendarMessage(
        currentInput,
        store.provider,
        store.model,
        store.calendarid ?? "",
        store.type_calendar ?? "",
        uploadedUrls.length > 0 ? uploadedUrls : undefined,
        (data) => {
          store.updateSessionMessages_calendar((prev) => {
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
          store.updateSessionMessages_calendar((prev) => {
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
          store.updateSessionMessages_calendar((prev) => {
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
            store.threadIdRef_calendar.current = data.thread_id;
            store.pendingApprovalRef_calendar.current = {
              name: toolCall.name,
              query: toolCall.query ?? null,
            };
            store.setPendingApproval_calendar({
              name: toolCall.name,
              query: toolCall.query ?? null,
            });
          }
        },
        (url: string) => {
          store.updateSessionMessages_calendar((prev) => {
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
        store.reasoningLevel_calendar || undefined,
      );
    } catch (err) {
      if ((err as any)?.name === "AbortError") {
        if (abortControllerRef.current === controller) {
          store.setInput_calendar(lastSentInputRef.current);
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
        store.setSending_calendar(false);
        abortControllerRef.current = null;
      }
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["creditBalance"], refetchType: "all" });
    }
  };

  const startRecording = async () => {
    if (store.recordstatus_calendar) {
      stopRecording();
      return;
    }

    store.setInput_calendar("");

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
      store.setrecordstatus_calendar(false);

      const form = new FormData();
      form.append("voice", audioBlob, "voice.webm");

      try {
        store.setloadingrecord_calendar(true);
        const response = await voiceauth.sendvoice(form);
        if (response.transcribe) {
          store.setInput_calendar(response.transcribe);
        }
      } catch (err) {
        if (err instanceof Error) {
          const Error = err as any;
          toast.error(Error.response?.data?.message || err.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        store.setloadingrecord_calendar(false);
      }
    };

    mediaRecorder.start();
    store.setrecordstatus_calendar(true);
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
    store.loadingrecord_calendar ||
    store.recordstatus_calendar ||
    store.uploadingImages_calendar;

  const renderTypeBadge = () => {
    const labels: Record<string, string> = {
      read: "List Events",
      create: "Create Event",
      update: "Update Event",
      delete: "Delete Event",
    };
    if (!store.type_calendar || !labels[store.type_calendar]) return null;
    return (
      <button
        onClick={() => {
          store.settype_calendar("text");
        }}
        disabled={store.sending_calendar}
        className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
      >
        <X size={17} className="text-blue-400" />
        <span className="text-[13px] text-blue-400">{labels[store.type_calendar]}</span>
      </button>
    );
  };

  return (
    <>
      <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3">
        <div className="flex gap-2">
          <Button
            onClick={calendarmsgdelete}
            disabled={store.sessionmessage_calendar.length === 0 || loadingcalendardelete}
            className="bg-cyan-500 dark:bg-white"
          >
            {loadingcalendardelete ? (
              <Spinner />
            ) : (
              <>
                <RefreshCw />
                Reset Chat
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          {serviceemail ? (
            <Select
              key={`${store.provider}-${store.type_calendar}`}
              onValueChange={(val) => store.setcalendarid(val ?? "")}
              value={store.calendarid}
              disabled={!store.provider}
            >
              <SelectTrigger>
                {store.calendarid && (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                    className="w-4 h-4 shrink-0"
                  />
                )}
                <span className="truncate">
                  {store.calendarid ? selectedCalendarTitle : "Select calendar"}
                </span>
              </SelectTrigger>
              <SelectContent className="p-1 w-60">
                <SelectItem value="primary">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                    className="w-4 h-4 shrink-0"
                  />
                  Primary Calendar
                </SelectItem>
                {calendars
                  .filter((c: any) => c.calendarId !== "primary")
                  .map((c: any) => (
                    <SelectItem key={c.id} value={c.calendarId}>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                        className="w-4 h-4 shrink-0"
                      />
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <Button
              onClick={connectGoogle}
              disabled={isChecking}
              className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
            >
              {isChecking ? <Spinner /> : "Connect Google"}
            </Button>
          )}
        </div>
      </div>
      <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
        <ImagePreview
          images={store.pendingImages_calendar}
          onImagesChange={store.setPendingImages_calendar}
          uploading={store.uploadingImages_calendar}
        />
        <Textarea
          disabled={isDisabled}
          value={store.input_calendar}
          onChange={(e) => store.setInput_calendar(e.target.value)}
          placeholder={
            store.recordstatus_calendar
              ? "Listening..."
              : store.loadingrecord_calendar
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
              images={store.pendingImages_calendar}
              onImagesChange={store.setPendingImages_calendar}
              uploading={store.uploadingImages_calendar}
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

              <DropdownMenuContent align="start" side="top" className="w-45">
                <DropdownMenuItem onClick={() => store.settype_calendar("read")}>
                  <Box /> List Events
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_calendar("create")}>
                  <Box /> Create Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_calendar("update")}>
                  <Box /> Update Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => store.settype_calendar("delete")}>
                  <Box /> Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {renderTypeBadge()}
          </div>
          <div className="flex gap-2">
            {Api.length > 0 && (
              <ModelSelect
                modelList={store.modelList_calendar}
                provider={store.provider || ""}
                model={store.model}
                loading={store.modelsLoading_calendar}
                disabled={!store.provider}
                onSelect={store.setModel}
                reasoningLevel={store.reasoningLevel_calendar}
                onReasoningLevelChange={store.setReasoningLevel_calendar}
              />
            )}
            <Button
              disabled={
                store.loadingrecord_calendar || !serviceemail || !store.model || !store.provider
              }
              onClick={store.recordstatus_calendar ? stopRecording : startRecording}
              size="icon"
              className="bg-cyan-500 dark:bg-white rounded-full"
            >
              {store.recordstatus_calendar ? (
                <Square size={14} className="fill-current" />
              ) : store.loadingrecord_calendar ? (
                <Spinner />
              ) : (
                <Mic size={14} />
              )}
            </Button>
            <Button
              onClick={
                store.sending_calendar ? () => abortControllerRef.current?.abort() : handleSend
              }
              disabled={
                !store.sending_calendar &&
                (!store.provider ||
                  !store.model ||
                  (!store.input_calendar.trim() && store.pendingImages_calendar.length === 0) ||
                  store.loadingrecord_calendar ||
                  store.recordstatus_calendar ||
                  store.uploadingImages_calendar)
              }
              size="icon"
              className={
                store.sending_calendar
                  ? "bg-red-500 hover:bg-red-600 rounded-full"
                  : "bg-cyan-500 dark:bg-white rounded-full"
              }
            >
              {store.sending_calendar ? (
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
