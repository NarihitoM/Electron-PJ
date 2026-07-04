import { useEffect, useRef, useState } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useQueryClient } from "@tanstack/react-query";
import { BRAND_ASSETS, getProviderModels } from "@/shared/config/providermodels";
import { chatauthstore } from "@/features/chat/store/store";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { chatsession } from "@/shared/types/globaltype";
import { voiceauth } from "@/features/voice/api/api";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import { Server } from "@/shared/config/axioconfig";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { chatauth } from "@/features/chat/api/api";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { ChatMessageList } from "@/features/chat/components/ChatMessageList";
import { ChatInput } from "@/features/chat/components/ChatInput";
import { ServiceConnectionPanel } from "@/features/chat/components/ServiceConnectionPanel";



export const Chat = () => {

    //fetchid from url
    const { id } = useParams();
    //Store
    const { data: userdata } = useUser();
    const {
        sendmessage,
        fetchmessage,
        model,
        provider,
        reasoningLevel,
        setModel,
        setProvider,
        setReasoningLevel
    } = chatauthstore();
    const { data: Api = [], refetch: fetchservicekey } = useServiceKeys()
    const queryClient = useQueryClient()

    //States
    const [sessionmessage, setsessionmessage] = useState<chatsession[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loadingfetch, setloadingfetch] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [type, settype] = useState<string | null>("text");
    const [recordstatus, setrecordstatus] = useState<boolean>(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [loadingrecord, setloadingrecord] = useState<boolean>(false);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingerror, setloadingerror] = useState<boolean>(false);
    const topSentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastSentInputRef = useRef<string>("");
    const [modelList, setModelList] = useState<ModelEntry[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [pendingApproval, setPendingApproval] = useState<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const pendingApprovalRef = useRef<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const threadIdRef = useRef<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [pendingImages, setPendingImages] = useState<File[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingImageUrls, setUploadingImageUrls] = useState<Set<string>>(new Set());
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);


    //Navigation
    const navigate = useNavigate();

    useEffect(() => {
        fetchservicekey();
    }, [])

    //Smooth Scrolling
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [sessionmessage, sending]);

    //Fetch models when provider changes
    useEffect(() => {
        if (!provider) { setModelList([]); return; }
        setModelsLoading(true);
        getProviderModels(provider).then(models => {
            setModelList(models);
            setModelsLoading(false);
            if (models.length > 0 && !models.some((m: any) => m.model === model)) {
                setModel(models[0].model);
            }
        });
    }, [provider]);


    //Load older messages (cursor-based pagination)
    const loadMore = async () => {
        if (!nextCursor || !hasMore || loadingMore) return;
        setLoadingMore(true);
        try {
            const container = scrollContainerRef.current;
            const prevScrollHeight = container?.scrollHeight ?? 0;

            const response = await fetchmessage(id as string, nextCursor);
            if (response.success && response.data) {
                const data = response.data;
                setsessionmessage(prev => [...(data.messages ?? []), ...prev]);
                setNextCursor(data.nextCursor);
                setHasMore(data.hasMore);

                requestAnimationFrame(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - prevScrollHeight;
                    }
                });
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setLoadingMore(false);
        }
    };

    //IntersectionObserver for infinite scroll up
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                loadMore();
            }
        }, { threshold: 0.1 });

        const el = topSentinelRef.current;
        if (el) observer.observe(el);

        return () => observer.disconnect();
    }, [hasMore, loadingMore, id]);

    //Send the message to ai
    const handleSend = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            if (!input.trim() && pendingImages.length === 0) return;
        }

        if ((!input.trim() && pendingImages.length === 0) || !provider || !model)
            return;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setSending(true);

        const currentInput = input;
        const currentImages = [...pendingImages];
        lastSentInputRef.current = currentInput;
        setInput("");
        setPendingImages([]);

        // Create blob URLs for immediate preview
        const blobUrls = currentImages.map(file => URL.createObjectURL(file));

        // Add user message immediately with blob URLs
        const userMsg: chatsession = { role: "user", content: currentInput, images: blobUrls.length > 0 ? blobUrls : undefined };
        setsessionmessage((prev) => [
            ...prev,
            userMsg,
            { role: "assistant", content: "", provider, model }
        ]);

        // Mark these blob URLs as uploading
        if (blobUrls.length > 0) {
            setUploadingImageUrls(new Set(blobUrls));
        }

        // Upload images in background
        let uploadedUrls: string[] = [];
        if (currentImages.length > 0) {
            setUploadingImages(true);
            try {
                uploadedUrls = await Promise.all(
                    currentImages.map(file => chatauth.uploadImage(file))
                );
            } catch (err) {
                toast.error("Failed to upload images");
                setSending(false);
                setUploadingImages(false);
                setUploadingImageUrls(new Set());
                // Remove the message we just added
                setsessionmessage(prev => prev.slice(0, -2));
                return;
            }
            setUploadingImages(false);
            setUploadingImageUrls(new Set());

            // Replace blob URLs with real uploaded URLs in the message
            setsessionmessage(prev => {
                const newMsgs = [...prev];
                const userMsgIdx = newMsgs.length - 2; // -2 because assistant msg is last
                if (userMsgIdx >= 0 && newMsgs[userMsgIdx].role === "user") {
                    newMsgs[userMsgIdx] = { ...newMsgs[userMsgIdx], images: uploadedUrls };
                }
                return newMsgs;
            });

            // Revoke blob URLs
            blobUrls.forEach(url => URL.revokeObjectURL(url));
        }

        try {
            await sendmessage(
                id as string,
                provider,
                model,
                currentInput,
                type ?? "text",
                uploadedUrls.length > 0 ? uploadedUrls : undefined,
                (chunk: string) => {
                    setsessionmessage((prev) => {
                        const newMessages = [...prev];
                        const lastIndex = newMessages.length - 1;
                        if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
                            newMessages[lastIndex] = {
                                ...newMessages[lastIndex],
                                content: newMessages[lastIndex].content + chunk,
                            };
                        }
                        return newMessages;
                    });
                    scrollToBottom();
                },
                (status) => {
                    setsessionmessage((prev) => {
                        const newSession = [...prev];
                        const lastIndex = newSession.length - 1;

                        if (newSession[lastIndex]?.role !== "assistant") return prev;

                        const currentMessage = { ...newSession[lastIndex] };
                        const toolCalls = [...(currentMessage.toolsCall || [])];

                        if (status.step === "tool_start") {
                            toolCalls.push({
                                id: status.id,
                                name: status.tool ?? "Tool",
                                query: status.query as any ?? null,
                                status: "loading",
                                result: null
                            });
                        }

                        else if (status.step === "tool_end") {
                            const toolIndex = toolCalls.findIndex(t => t.id === status.id);
                            if (toolIndex !== -1) {
                                toolCalls[toolIndex] = { ...toolCalls[toolIndex], status: "done", result: status.result };
                            }
                        }

                        else if (status.step === "tool_error") {
                            const toolIndex = toolCalls.findIndex(t => t.id === status.id);
                            if (toolIndex !== -1) {
                                toolCalls[toolIndex] = { ...toolCalls[toolIndex], status: "error", result: status.error };
                            }
                        }

                        newSession[lastIndex] = { ...currentMessage, toolsCall: toolCalls }; return newSession;
                    });
                },
                (data: { thread_id: string; tool_calls: Array<{ id: string; name: string; query: Record<string, unknown> }> }) => {
                    const toolCall = data.tool_calls[0];
                    if (toolCall) {
                        threadIdRef.current = data.thread_id;
                        pendingApprovalRef.current = { name: toolCall.name, query: toolCall.query ?? null };
                        setPendingApproval({ name: toolCall.name, query: toolCall.query ?? null });
                    }
                },
                controller.signal,
                reasoningLevel || undefined,
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
            )
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
                toast.error("An unexpected error occurred.")
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setSending(false);
                abortControllerRef.current = null;
            }
            queryClient.invalidateQueries({ queryKey: ["message", id] });
        }
    };

    const handleApprove = () => {
        if (pendingApprovalRef.current) {
            Server.post("/tool/approve", { thread_id: threadIdRef.current }).catch(() => {});
            pendingApprovalRef.current = null;
            setPendingApproval(null);
        }
    };

    const handleReject = () => {
        if (pendingApprovalRef.current) {
            const { name, query } = pendingApprovalRef.current;
            const fallbackId = `${name}-${Date.now()}`;
            setsessionmessage((prev) => {
                const newSession = [...prev];
                const lastIndex = newSession.length - 1;
                if (newSession[lastIndex]?.role !== "assistant") return prev;
                const currentMessage = { ...newSession[lastIndex] };
                const toolCalls = [...(currentMessage.toolsCall || [])];
                toolCalls.push({ id: fallbackId, name, query, status: "rejected", result: "Tool execution rejected by user." });
                newSession[lastIndex] = { ...currentMessage, toolsCall: toolCalls };
                return newSession;
            });
            Server.post("/tool/reject", { thread_id: threadIdRef.current }).catch(() => {});
            pendingApprovalRef.current = null;
            setPendingApproval(null);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    //fetchthechatmessage with cursor-based pagination
    const fetchMessages = async () => {
        try {
            setloadingfetch(true);
            setloadingerror(false);
            setSending(false);
            setsessionmessage([]);
            setNextCursor(null);
            setHasMore(false);
            const response = await fetchmessage(
                id as string
            )
            if (response.success && response.data) {
                setsessionmessage((response.data.messages ?? []));
                setNextCursor(response.data.nextCursor);
                setHasMore(response.data.hasMore);
            }
        }
        catch (err: unknown) {
            setloadingerror(true);
            if (err instanceof Error) {
                const Error = err as any;
                toast.error(Error.response?.data?.message || err.message);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
        finally {
            setloadingfetch(false);
        }
    }

    useEffect(() => {
        fetchMessages();
    }, [id])


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
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            setrecordstatus(false);

            const form = new FormData();
            form.append("voice", audioBlob, "voice.webm");


            try {
                setloadingrecord(true)
                const response = await voiceauth.sendvoice(form);
                if (response.transcribe) {
                    setInput(response.transcribe);
                }
            }
            catch (err) {
                if (err instanceof Error) {
                    const Error = err as any;
                    const error = Error.response?.data?.message || err.message;
                    toast.error(error);
                } else {
                    toast.error("An unexpected error occurred.")
                }
            }
            finally {
                setloadingrecord(false)
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
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const apiWithLogos = Api ? Api.map((provider) => ({
        ...provider,
        imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()]
    })) : [];

    return (
        <>
            <Toaster position="top-right" richColors />
            <ToolApprovalDialog
                open={pendingApproval !== null}
                toolName={pendingApproval?.name || ""}
                toolQuery={pendingApproval?.query || null}
                onApprove={handleApprove}
                onReject={handleReject}
            />
            <div className="flex h-[92vh] w-full flex-col bg-background">
                {Api.length > 0 ? (
                    <>
                        <ChatHeader
                            apiWithLogos={apiWithLogos}
                            provider={provider}
                            onProviderChange={(value) => setProvider(value)}
                            onAddProvider={() => navigate("/app/settings")}
                        />
                        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                            <ChatMessageList
                                messages={sessionmessage}
                                loadingfetch={loadingfetch}
                                loadingerror={loadingerror}
                                sending={sending}
                                loadingMore={loadingMore}
                                userdata={userdata ?? undefined}
                                uploadingImageUrls={uploadingImageUrls}
                                copiedIndex={copiedIndex}
                                onFetchMessages={fetchMessages}
                                onSetCopiedIndex={setCopiedIndex}
                                onSetLightboxImages={setLightboxImages}
                                onSetLightboxIndex={setLightboxIndex}
                                onSetLightboxOpen={setLightboxOpen}
                                topSentinelRef={topSentinelRef}
                                messagesEndRef={messagesEndRef}
                                apiLength={Api.length}
                                onAddProvider={() => navigate("/app/settings")}
                            />
                        </div>
                        <ChatInput
                            input={input}
                            onInputChange={setInput}
                            onSend={handleSend}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            disabled={!model || !provider || loadingrecord || recordstatus}
                            sending={sending}
                            onStopSend={() => abortControllerRef.current?.abort()}
                            recordstatus={recordstatus}
                            loadingrecord={loadingrecord}
                            onStartRecording={startRecording}
                            onStopRecording={stopRecording}
                            pendingImages={pendingImages}
                            onSetPendingImages={setPendingImages}
                            uploadingImages={uploadingImages}
                            type={type}
                            onSetType={settype}
                            modelList={modelList}
                            provider={provider || ""}
                            model={model}
                            modelsLoading={modelsLoading}
                            onSelectModel={setModel}
                            reasoningLevel={reasoningLevel || undefined}
                            onReasoningLevelChange={setReasoningLevel}
                            apiLength={Api.length}
                        />
                    </>
                ) : (
                    <div className="flex flex-col gap-4">
                        <ChatHeader
                            apiWithLogos={apiWithLogos}
                            provider={provider}
                            onProviderChange={(value) => setProvider(value)}
                            onAddProvider={() => navigate("/app/settings")}
                        />
                        <ServiceConnectionPanel onAddProvider={() => navigate("/app/settings")} />
                    </div>
                )}
            </div>
            <ImageLightbox
                images={lightboxImages}
                initialIndex={lightboxIndex}
                open={lightboxOpen}
                onOpenChange={setLightboxOpen}
            />
        </>
    );
}
