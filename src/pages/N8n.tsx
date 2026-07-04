import { useEffect, useRef, useState } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import { BRAND_ASSETS, getProviderModels } from "@/shared/config/providermodels";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { chatsession } from "@/shared/types/globaltype";
import { voiceauth } from "@/features/voice/api/api";
import { n8nauth } from "@/features/n8n/api/api";
import { useN8nConfig } from "@/features/n8n/hooks/useN8nConfig";
import { n8nauthstore } from "@/features/n8n/store/store";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { Server } from "@/shared/config/axioconfig";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { chatauth } from "@/features/chat/api/api";

import { N8nChatHeader } from "@/features/n8n/components/N8nChatHeader";
import { N8nConnectionPanel } from "@/features/n8n/components/N8nConnectionPanel";
import { N8nMessageList } from "@/features/n8n/components/N8nMessageList";
import { N8nInput } from "@/features/n8n/components/N8nInput";

export const N8n = () => {
    //Store
    const { data: userdata } = useUser();
    const { data: n8nConfig } = useN8nConfig()
    const n8nUrl = (n8nConfig as any)?.n8nUrl ?? ""
    const authType = (n8nConfig as any)?.authType ?? ""
    const authValue = (n8nConfig as any)?.authValue ?? ""
    const connected = !!(n8nConfig as any)?.connected
    const detectedMode = (n8nConfig as any)?.detectedMode ?? ""
    const [loadingn8n] = useState(false)
    const [loadingn8nmsg] = useState(false)
    const {
        sendmessage,
        provider,
        model,
        setProvider,
        setModel,
    } = n8nauthstore();
    const { data: Api = [], refetch: fetchservicekey } = useServiceKeys();

    //States
    const [sessionmessage, setsessionmessage] = useState<chatsession[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const topSentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastSentInputRef = useRef<string>("");
    const [loadingfetch, setloadingfetch] = useState<boolean>(false);
    const [loadingerror, setloadingerror] = useState<boolean>(false);
    const [pendingApproval, setPendingApproval] = useState<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const pendingApprovalRef = useRef<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const threadIdRef = useRef<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [type, settype] = useState<string | null>("text");
    const [hover, setHover] = useState(false);
    const [recordstatus, setrecordstatus] = useState<boolean>(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [loadingrecord, setloadingrecord] = useState<boolean>(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [modelList, setModelList] = useState<ModelEntry[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [reasoningLevel, setReasoningLevel] = useState<"" | "low" | "medium" | "high">("");
    const [pendingImages, setPendingImages] = useState<File[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingImageUrls, setUploadingImageUrls] = useState<Set<string>>(new Set());
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [authTypeInput, setAuthTypeInput] = useState("cookie");
    const [authValueInput, setAuthValueInput] = useState("");
    const [testingMode, setTestingMode] = useState(false);
    const [testResult, setTestResult] = useState<{ restApiAvailable: boolean; mode: string } | null>(null);

    const navigate = useNavigate();

    //Smooth Scrolling
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    //Functions
    useEffect(() => {
        fetchservicekey();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [sessionmessage, sending]);

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

    const handleTestConnection = async () => {
        if (!urlInput.trim()) {
            toast.error("Please enter an n8n URL.");
            return;
        }
        setTestingMode(true);
        setTestResult(null);
        try {
            const result = await n8nauth.testConnection(urlInput.trim(), authTypeInput, authValueInput || undefined);
            if (result.success) {
                setTestResult(result.data);
                if (result.data.restApiAvailable) {
                    toast.success(`REST API detected! Mode: ${result.data.mode}`);
                } else {
                    toast.warning("REST API not available. Switching to webhook mode.");
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Failed to test connection.");
        } finally {
            setTestingMode(false);
        }
    };

    const handleConnect = async () => {
        if (!urlInput.trim()) {
            toast.error("Please enter an n8n URL.");
            return;
        }
        try {
            const authVal = authTypeInput === "none" ? undefined : authValueInput || undefined;
            const result = await n8nauth.connect(urlInput.trim(), authTypeInput, authVal);
            if (result.success) {
                toast.success("Connected to n8n!");
                setSettingsOpen(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Failed to connect.");
        }
    };

    const handleDisconnect = async () => {
        try {
            const result = await n8nauth.disconnect();
            if (result.success) {
                toast.success("Disconnected from n8n.");
                setSettingsOpen(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Failed to disconnect.");
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && pendingImages.length === 0) || sending || !model || !provider) return;

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
            await sendmessage(
                currentInput,
                provider,
                model,
                n8nUrl,
                authType,
                authValue || undefined,
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

                        if (status.step === "tool_start") {
                            toolCalls.push({
                                id: status.id,
                                name: status.tool ?? "Tool",
                                query: status.query as any ?? null,
                                status: "loading",
                                result: null
                            });
                        } else if (status.step === "tool_end") {
                            const toolIndex = toolCalls.findIndex(t => t.id === status.id);
                            if (toolIndex !== -1) {
                                toolCalls[toolIndex] = { ...toolCalls[toolIndex], status: "done", result: status.result };
                            }
                        } else if (status.step === "tool_error") {
                            const toolIndex = toolCalls.findIndex(t => t.id === status.id);
                            if (toolIndex !== -1) {
                                toolCalls[toolIndex] = { ...toolCalls[toolIndex], status: "error", result: status.error };
                            }
                        }

                        newSession[lastIndex] = { ...currentMessage, toolsCall: toolCalls };
                        return newSession;
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

    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    const fetchMessages = async () => {
        try {
            setloadingfetch(true);
            setloadingerror(false);
            setSending(false);
            setsessionmessage([]);
            setNextCursor(null);
            setHasMore(false);
            const response = await n8nauth.fetchn8nmsg();
            if (response.success && response.data) {
                setsessionmessage(response.data.messages ?? []);
                setNextCursor(response.data.nextCursor);
                setHasMore(response.data.hasMore);
            }
        } catch (err: unknown) {
            setloadingerror(true);
            if (err instanceof Error) {
                const Error = err as any;
                toast.error(Error.response?.data?.message || err.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setloadingfetch(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const loadMore = async () => {
        if (!nextCursor || !hasMore || loadingMore) return;
        setLoadingMore(true);
        try {
            const response = await n8nauth.fetchn8nmsg(nextCursor);
            if (response.success && response.data) {
                const data = response.data;
                setsessionmessage((prev) => [...data.messages.reverse(), ...prev]);
                setNextCursor(data.nextCursor);
                setHasMore(data.hasMore);
            }
        } catch (err) {
            console.error("Load more error:", err);
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
        if (topSentinelRef.current) observer.observe(topSentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadingMore]);

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
        mediaRecorder.ondataavailable = (event) => { audioChunks.push(event.data); };
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            setrecordstatus(false);
            const form = new FormData();
            form.append("voice", audioBlob, "voice.webm");
            try {
                setloadingrecord(true);
                const response = await voiceauth.sendvoice(form);
                if (response.transcribe) { setInput(response.transcribe); }
            } catch (err) {
                if (err instanceof Error) {
                    const Error = err as any;
                    const error = Error.response?.data?.message || err.message;
                    toast.error(error);
                } else {
                    toast.error("An unexpected error occurred.");
                }
            } finally { setloadingrecord(false); }
        };
        mediaRecorder.start();
        setrecordstatus(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") { mediaRecorderRef.current.stop(); }
        if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    };

    const deletemessages = async () => {
        try {
            const response = await n8nauth.n8ndeletemessage();
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
            <N8nConnectionPanel
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
                connected={connected}
                n8nUrl={n8nUrl}
                authType={authType}
                authValue={authValue}
                detectedMode={detectedMode}
                loadingn8n={loadingn8n}
                urlInput={urlInput}
                setUrlInput={setUrlInput}
                authTypeInput={authTypeInput}
                setAuthTypeInput={setAuthTypeInput}
                authValueInput={authValueInput}
                setAuthValueInput={setAuthValueInput}
                testingMode={testingMode}
                testResult={testResult}
                handleTestConnection={handleTestConnection}
                handleConnect={handleConnect}
                handleDisconnect={handleDisconnect}
            />
            <div className="flex h-[92vh] w-full flex-col bg-background">
                <N8nChatHeader
                    connected={connected}
                    authType={authType}
                    loadingn8n={loadingn8n}
                    setSettingsOpen={setSettingsOpen}
                    provider={provider}
                    setProvider={setProvider}
                    apiWithLogos={apiWithLogos}
                    navigate={navigate}
                />
                <N8nMessageList
                    sessionmessage={sessionmessage}
                    sending={sending}
                    loadingfetch={loadingfetch}
                    loadingn8n={loadingn8n}
                    loadingerror={loadingerror}
                    loadingMore={loadingMore}
                    userdata={userdata}
                    connected={connected}
                    authType={authType}
                    topSentinelRef={topSentinelRef}
                    scrollContainerRef={scrollContainerRef}
                    messagesEndRef={messagesEndRef}
                    uploadingImageUrls={uploadingImageUrls}
                    copiedIndex={copiedIndex}
                    setCopiedIndex={setCopiedIndex}
                    setLightboxImages={setLightboxImages}
                    setLightboxIndex={setLightboxIndex}
                    setLightboxOpen={setLightboxOpen}
                    setSettingsOpen={setSettingsOpen}
                    fetchMessages={fetchMessages}
                />
                <N8nInput
                    connected={connected}
                    model={model}
                    provider={provider}
                    input={input}
                    setInput={setInput}
                    sending={sending}
                    recordstatus={recordstatus}
                    loadingrecord={loadingrecord}
                    pendingImages={pendingImages}
                    setPendingImages={setPendingImages}
                    uploadingImages={uploadingImages}
                    type={type}
                    settype={settype}
                    hover={hover}
                    setHover={setHover}
                    handleSend={handleSend}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    deletemessages={deletemessages}
                    loadingn8nmsg={loadingn8nmsg}
                    sessionmessage={sessionmessage}
                    modelList={modelList}
                    modelsLoading={modelsLoading}
                    reasoningLevel={reasoningLevel}
                    setReasoningLevel={setReasoningLevel}
                    Api={Api}
                    setModel={setModel}
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
};
