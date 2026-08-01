import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Box, Mic, RefreshCw, Square, ToolCaseIcon, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { Spinner } from "@/shared/components/ui/spinner";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { toast } from "sonner";
import { getProviderModels } from "@/shared/config/providermodels";
import { useDiscordAccount } from "../hooks/useDiscordAccount";
import { useDiscordChannels } from "../hooks/useDiscordChannels";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { discordauth } from "../api/api";
import { chatauth } from "@/features/chat/api/api";
import { voiceauth } from "@/features/voice/api/api";
import { discordauthstore } from "../store/store";
import { useQueryClient } from "@tanstack/react-query";
import type { chatsession } from "@/shared/types/globaltype";
import type { ModelEntry } from "@/shared/lib/modelsapi";

const ToolButton: React.FC<{
  label: string;
  settype: (type: string | null) => void;
  sending: boolean;
}> = ({ label, settype, sending }) => {
  const [localHover, setLocalHover] = React.useState(false);
  return (
    <button
      onClick={() => {
        settype("text");
      }}
      disabled={sending}
      onMouseEnter={() => setLocalHover(true)}
      onMouseLeave={() => setLocalHover(false)}
      className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
    >
      {localHover ? (
        <X size={17} className="text-blue-400" />
      ) : (
        <Box size={17} className="text-blue-400" />
      )}
      <span className="text-[13px] text-blue-400">{label}</span>
    </button>
  );
};

export const DiscordInput = () => {
  const {
    sessionmessage,
    setsessionmessage,
    sending,
    setSending,
    setPendingApproval,
    pendingApprovalRef,
    threadIdRef,
    uploadingImages,
    setUploadingImages,
    setUploadingImageUrls,
    model,
    setModel,
    provider,
    setNextCursor,
    setHasMore,
    channelid,
    setChannelid,
    loadingdiscorddelmsg,
    setLoadingdiscorddelmsg,
  } = discordauthstore();

  const queryClient = useQueryClient();
  const { data: discordAccount } = useDiscordAccount();
  const { data: Api = [] } = useServiceKeys();

  const guildName = (discordAccount as any)?.guildName ?? "";
  const guildId = (discordAccount as any)?.guildId ?? "";
  const { data: channels = [], isLoading: loadingChannels } = useDiscordChannels(!!guildId);

  const [input, setInput] = useState("");
  const [type, settype] = useState<string | null>("text");
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [reasoningLevel, setReasoningLevel] = useState<"" | "low" | "medium" | "high">("");
  const [recordstatus, setrecordstatus] = useState(false);
  const [loadingrecord, setloadingrecord] = useState(false);
  const [modelList, setModelList] = useState<ModelEntry[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSentInputRef = useRef<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!provider) {
      setModelList([]);
      return;
    }
    setModelsLoading(true);
    getProviderModels(provider).then((models) => {
      setModelList(models);
      setModelsLoading(false);
      if (models.length > 0 && !models.some((m) => m.model === model)) {
        setModel(models[0].model);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!channelid && channels.length > 0) {
      setChannelid(channels[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels]);

  const scrollToBottom = () => {
    const el = document.querySelector("[data-messages-end]");
    el?.scrollIntoView({ behavior: "auto" });
  };

  const handleSend = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      if (!input.trim()) return;
    }

    if (!input.trim() || !provider || !model || !channelid) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSending(true);

    const currentInput = input;
    const currentImages = [...pendingImages];
    lastSentInputRef.current = currentInput;
    setInput("");
    setPendingImages([]);

    const blobUrls = currentImages.map((file) => URL.createObjectURL(file));

    const userMsg: chatsession = {
      role: "user",
      content: currentInput,
      images: blobUrls.length > 0 ? blobUrls : undefined,
    };
    setsessionmessage((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: "", provider, model },
    ]);

    if (blobUrls.length > 0) {
      setUploadingImageUrls(new Set(blobUrls));
    }

    let uploadedUrls: string[] = [];
    if (currentImages.length > 0) {
      setUploadingImages(true);
      try {
        uploadedUrls = await Promise.all(currentImages.map((file) => chatauth.uploadImage(file)));
      } catch (err) {
        toast.error("Failed to upload images");
        setSending(false);
        setUploadingImages(false);
        setUploadingImageUrls(new Set());
        setsessionmessage((prev) => prev.slice(0, -2));
        return;
      }
      setUploadingImages(false);
      setUploadingImageUrls(new Set());

      setsessionmessage((prev) => {
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
      await discordauth.sendmessage(
        currentInput,
        provider,
        model,
        channelid ?? "",
        guildName ?? "",
        type ?? "",
        uploadedUrls.length > 0 ? uploadedUrls : undefined,
        (data) => {
          setsessionmessage((prev) => {
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
          setsessionmessage((prev) => {
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
          setsessionmessage((prev) => {
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
                query: (status.query as any) ?? null,
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
        (data: {
          thread_id: string;
          tool_calls: Array<{ id: string; name: string; query: Record<string, unknown> }>;
        }) => {
          const toolCall = data.tool_calls[0];
          if (toolCall) {
            threadIdRef.current = data.thread_id;
            pendingApprovalRef.current = { name: toolCall.name, query: toolCall.query ?? null };
            setPendingApproval({ name: toolCall.name, query: toolCall.query ?? null });
          }
        },
        (url: string) => {
          setsessionmessage((prev) => {
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
          scrollToBottom();
        },
        controller.signal,
        reasoningLevel || undefined,
      );
    } catch (err) {
      if ((err as any)?.name === "AbortError") {
        if (abortControllerRef.current === controller) {
          setInput(lastSentInputRef.current);
        }
        return;
      }
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setSending(false);
        abortControllerRef.current = null;
      }
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["creditBalance"], refetchType: "all" });
    }
  };

  const startRecording = async () => {
    if (recordstatus) {
      stopRecording();
      return;
    }

    setInput("");

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
          setInput(response.transcribe);
        }
      } catch (err) {
        if (err instanceof Error) {
          const Error = err as any;
          const error = Error.response?.data?.message || err.message;
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

  const deletediscordmessage = async () => {
    try {
      setLoadingdiscorddelmsg(true);
      const response = await discordauth.deletediscordmsg();
      if (response.success) {
        toast.success(response.message);
        setsessionmessage([]);
        setNextCursor(null);
        setHasMore(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoadingdiscorddelmsg(false);
    }
  };

  return (
    <>
      <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
        <div className="flex gap-2">
          <Button
            onClick={deletediscordmessage}
            disabled={sessionmessage.length === 0 || loadingdiscorddelmsg}
            className="bg-cyan-500 dark:bg-white"
          >
            {loadingdiscorddelmsg ? (
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
          {guildId && (
            <Select
              value={channelid}
              onValueChange={(value) => setChannelid(value ?? "")}
              disabled={!provider}
            >
              <SelectTrigger className="w-40">
                {loadingChannels
                  ? "Loading channels..."
                  : channels.find((c) => c.id === channelid)?.name
                    ? `#${channels.find((c) => c.id === channelid)?.name}`
                    : "Select Channel"}
              </SelectTrigger>
              <SelectContent>
                {channels.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    #{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
        <ImagePreview
          images={pendingImages}
          onImagesChange={setPendingImages}
          uploading={uploadingImages}
        />
        <Textarea
          disabled={
            Api.length === 0 || !guildId || !model || !provider || loadingrecord || recordstatus
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
              images={pendingImages}
              onImagesChange={setPendingImages}
              uploading={uploadingImages}
              disabled={
                Api.length === 0 || !guildId || !model || !provider || loadingrecord || recordstatus
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
                <DropdownMenuItem onClick={() => settype("read")}>
                  <Box /> Read Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => settype("send")}>
                  <Box /> Send Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => settype("listconversation")}>
                  <Box /> List Channels
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {type === "send" && (
              <ToolButton label="Send Message" settype={settype} sending={sending} />
            )}
            {type === "read" && (
              <ToolButton label="Read Message" settype={settype} sending={sending} />
            )}
            {type === "listconversation" && (
              <ToolButton label="List Channels" settype={settype} sending={sending} />
            )}
          </div>
          <div className="flex gap-2">
            {Api.length > 0 && (
              <ModelSelect
                modelList={modelList}
                provider={provider || ""}
                model={model}
                loading={modelsLoading}
                disabled={!provider}
                onSelect={setModel}
                reasoningLevel={reasoningLevel}
                onReasoningLevelChange={setReasoningLevel}
              />
            )}
            <Button
              disabled={loadingrecord || !guildId || !model || !provider}
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
              onClick={sending ? () => abortControllerRef.current?.abort() : handleSend}
              disabled={
                !sending &&
                (uploadingImages ||
                  !guildId ||
                  (!input.trim() && pendingImages.length === 0) ||
                  !model ||
                  !provider ||
                  !channelid ||
                  loadingrecord ||
                  recordstatus)
              }
              size="icon"
              className={
                sending
                  ? "bg-red-500 hover:bg-red-600 rounded-full"
                  : "bg-cyan-500 dark:bg-white rounded-full"
              }
            >
              {sending ? <Square size={16} className="fill-current" /> : <ArrowUp size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
