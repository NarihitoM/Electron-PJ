import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useGoogleService } from "@/features/google/hooks/useGoogleService";
import { googleauth } from "@/features/google/api/api";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import { BRAND_ASSETS, getProviderModels } from "@/shared/config/providermodels";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { chatsession } from "@/shared/types/globaltype";
import { googleauthstore } from "@/features/google/store/store";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { Server } from "@/shared/config/axioconfig";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { chatauth } from "@/features/chat/api/api";
import { voiceauth } from "@/features/voice/api/api";
import { GoogleSheetHeader } from "@/features/google/components/GoogleSheetHeader";
import { GoogleSheetMessageList } from "@/features/google/components/GoogleSheetMessageList";
import { GoogleSheetInput } from "@/features/google/components/GoogleSheetInput";
import { GoogleSheetConnectionPanel } from "@/features/google/components/GoogleSheetConnectionPanel";


export const Googlesheet = () => {

    //Store
    const { data: userdata } = useUser();

    const { data: Api = [], refetch: fetchservicekey } = useServiceKeys()
    const { data: googleService, refetch: fetchgoogleservice } = useGoogleService()

    const {
        sheeturl,
        setsheeturl,
        setModel,
        setProvider,
        model,
        provider,
    } = googleauthstore()

    const [loadingfetch, setloadingfetch] = useState<boolean>(false);
    const serviceemail = (googleService as any)?.email ?? ""
    const sheet = (googleService as any)?.googlesheet ?? []
    const loading = loadingfetch
    const loadingsheet = loadingfetch
    const loadingsheetdelete = loadingfetch

    //States
    const [sessionmessage, setsessionmessage] = useState<chatsession[]>([]);
    const [input, setInput] = useState<string>("");
    const [sending, setSending] = useState(false);
    // loadingfetch/setloadingfetch declared above in store block
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [type, settype] = useState<string | null>("text");
    const [hover, setHover] = useState<boolean>(false);
    const [opensheet, setopensheet] = useState<boolean>(false);
    const [sheetinput, setsheetinput] = useState<string>("");
    const [useremail, setuseremail] = useState<string>("");
    const [key, setkey] = useState<string>("");
    const [openservice, setopenservice] = useState<boolean>(false);
    const [recordstatus, setrecordstatus] = useState<boolean>(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [loadingrecord, setloadingrecord] = useState<boolean>(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingerror, setloadingerror] = useState<boolean>(false);
    const topSentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastSentInputRef = useRef<string>("");
    const [pendingApproval, setPendingApproval] = useState<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const pendingApprovalRef = useRef<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const threadIdRef = useRef<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [modelList, setModelList] = useState<ModelEntry[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [reasoningLevel, setReasoningLevel] = useState<"" | "low" | "medium" | "high">("");
    const [pendingImages, setPendingImages] = useState<File[]>([]);
    const [uploadingImages, setUploadingImages] = useState<boolean>(false);
    const [uploadingImageUrls, setUploadingImageUrls] = useState<Set<string>>(new Set());
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    //Navigation
    const navigate = useNavigate();

    //Functions
    useEffect(() => {
        fetchservicekey();
    }, [])

    useEffect(() => {
        fetchgoogleservice();
    }, [])

    useEffect(() => {
        if (!provider) { setModelList([]); return; }
        setModelsLoading(true);
        getProviderModels(provider).then(models => {
            setModelList(models);
            setModelsLoading(false);
            if (models.length > 0 && !models.some(m => m.model === model)) {
                setModel(models[0].model);
            }
        });
    }, [provider]);

    //Smooth Scrolling
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [sessionmessage, sending]);

    const loadMore = async () => {
        if (!nextCursor || !hasMore || loadingMore) return;
        setLoadingMore(true);
        try {
            const container = scrollContainerRef.current;
            const prevScrollHeight = container?.scrollHeight ?? 0;

            const response = await googleauth.fetchsheetmessage(nextCursor);
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

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                loadMore();
            }
        }, { threshold: 0.1 });

        const el = topSentinelRef.current;
        if (el) observer.observe(el);

        return () => observer.disconnect();
    }, [hasMore, loadingMore]);

    //Send the message to ai
    const handleSend = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            if (!input.trim()) return;
        }

        if ((!input.trim() && pendingImages.length === 0) || !provider || !model || uploadingImages)
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
                setsessionmessage(prev => prev.slice(0, -2));
                return;
            }
            setUploadingImages(false);
            setUploadingImageUrls(new Set());

            // Replace blob URLs with real uploaded URLs
            setsessionmessage(prev => {
                const newMsgs = [...prev];
                const userMsgIdx = newMsgs.length - 2;
                if (userMsgIdx >= 0 && newMsgs[userMsgIdx].role === "user") {
                    newMsgs[userMsgIdx] = { ...newMsgs[userMsgIdx], images: uploadedUrls };
                }
                return newMsgs;
            });

            blobUrls.forEach(url => URL.revokeObjectURL(url));
        }

        try {
            await googleauth.sendsheetmessage(
                currentInput,
                provider,
                model,
                sheeturl ?? "",
                type ?? "",
                uploadedUrls.length > 0 ? uploadedUrls : undefined,
                (data) => {
                    setsessionmessage((prev) => {
                        const newSession = [...prev];
                        const lastIndex = newSession.length - 1;
                        if (newSession[lastIndex]?.role === "assistant") {
                            newSession[lastIndex] = {
                                ...newSession[lastIndex],
                                content: newSession[lastIndex].content + data
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
                        }

                        else if (status.type === "chain" && status.step === "end") {
                            const idx = toolCalls.findIndex(t => t.id === status.id);
                            if (idx !== -1) {
                                toolCalls[idx] = { ...toolCalls[idx], status: "done", output: status.output };
                            }
                        }

                        else if (status.step === "tool_start") {
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
                toast.error("An unexpected error occurred.")
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setSending(false);
                abortControllerRef.current = null;
            }
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

    //fetchthechatmessage
    const fetchMessages = async () => {
        try {
            setloadingfetch(true);
            setloadingerror(false);
            setSending(false);

            setsessionmessage([]);
            setNextCursor(null);
            setHasMore(false);
            const response = await googleauth.fetchsheetmessage()
            if (response.success && response.data) {
                setsessionmessage(response.data.messages ?? []);
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
    }, [])

    const addsheetsheeturl = async () => {
        try {
            const response = await googleauth.addgooglesheeturl(sheetinput);
            if (response.success) {
                toast.success(response.message);
            }
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
        finally {
            setopensheet(false);
            setsheetinput("")
        }
    }

    const addservice = async () => {
        try {
            const response = await googleauth.addservice(useremail, key);
            if (response.success) {
                toast.success(response.message);
            }
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
        finally {
            setopenservice(false);
            setuseremail("");
            setsheetinput("")
            setkey("");
        }
    }

    const selectedsheetTitle = useMemo(() => {
        return sheet.find((g: any) => g.url === sheeturl)?.name || "";
    }, [sheeturl, sheet]);


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


    const sheetmsgdelete = async () => {
        try {
            const response = await googleauth.deletesheetmsg();
            if (response.success) {
                toast.success(response.message);
                setsessionmessage([]);
                setNextCursor(null);
                setHasMore(false);
            }
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
    }

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
            <GoogleSheetConnectionPanel
                opensheet={opensheet}
                setopensheet={setopensheet}
                sheetinput={sheetinput}
                setsheetinput={setsheetinput}
                loadingsheet={loadingsheet}
                addsheetsheeturl={addsheetsheeturl}
                openservice={openservice}
                setopenservice={setopenservice}
                useremail={useremail}
                setuseremail={setuseremail}
                key={key}
                setkey={setkey}
                loading={loading}
                addservice={addservice}
                serviceemail={serviceemail}
                sheet={sheet}
                sheeturl={sheeturl}
                setsheeturl={setsheeturl}
                provider={provider}
                loadingfetch={loadingfetch}
                selectedsheetTitle={selectedsheetTitle}
                sessionmessage={sessionmessage}
                loadingsheetdelete={loadingsheetdelete}
                sheetmsgdelete={sheetmsgdelete}
                type={type}
            />
            <div className="flex h-[92vh] w-full flex-col bg-background">
                <GoogleSheetHeader
                    loadingfetch={loadingfetch}
                    serviceemail={serviceemail}
                    Api={Api}
                    apiWithLogos={apiWithLogos}
                    provider={provider}
                    setProvider={setProvider}
                    navigate={navigate}
                />
                <GoogleSheetMessageList
                    loadingfetch={loadingfetch}
                    loadingerror={loadingerror}
                    sessionmessage={sessionmessage}
                    sending={sending}
                    userdata={userdata}
                    uploadingImageUrls={uploadingImageUrls}
                    messagesEndRef={messagesEndRef}
                    topSentinelRef={topSentinelRef}
                    scrollContainerRef={scrollContainerRef}
                    loadingMore={loadingMore}
                    copiedIndex={copiedIndex}
                    setCopiedIndex={setCopiedIndex}
                    setLightboxImages={setLightboxImages}
                    setLightboxIndex={setLightboxIndex}
                    setLightboxOpen={setLightboxOpen}
                    setopenservice={setopenservice}
                    serviceemail={serviceemail}
                    fetchMessages={fetchMessages}
                />
                <GoogleSheetInput
                    Api={Api}
                    provider={provider}
                    model={model}
                    modelList={modelList}
                    modelsLoading={modelsLoading}
                    reasoningLevel={reasoningLevel}
                    setReasoningLevel={setReasoningLevel}
                    setModel={setModel}
                    serviceemail={serviceemail}
                    sheet={sheet}
                    input={input}
                    setInput={setInput}
                    type={type}
                    settype={settype}
                    hover={hover}
                    setHover={setHover}
                    sending={sending}
                    recordstatus={recordstatus}
                    loadingrecord={loadingrecord}
                    uploadingImages={uploadingImages}
                    pendingImages={pendingImages}
                    setPendingImages={setPendingImages}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    handleSend={handleSend}
                    abortControllerRef={abortControllerRef}
                />
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