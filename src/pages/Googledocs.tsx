import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import { BRAND_ASSETS, getProviderModels } from "@/shared/config/providermodels";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { chatsession } from "@/shared/types/globaltype";
import { googleauth } from "@/features/google/api/api";
import { googleauthstore } from "@/features/google/store/store";
import { useGoogleService } from "@/features/google/hooks/useGoogleService";
import { useDeleteGoogleDocMessage } from "@/features/google/hooks/useDeleteGoogleDocMessage";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { voiceauth } from "@/features/voice/api/api";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { Server } from "@/shared/config/axioconfig";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { chatauth } from "@/features/chat/api/api";
import { Button } from "@/shared/components/ui/button";
import { GoogleDocsHeader } from "@/features/google/components/GoogleDocsHeader";
import { GoogleDocsMessageList } from "@/features/google/components/GoogleDocsMessageList";
import { GoogleDocsConnectionPanel } from "@/features/google/components/GoogleDocsConnectionPanel";
import { GoogleDocsInput } from "@/features/google/components/GoogleDocsInput";

export const Googledocs = () => {

    //Store
    const { data: userdata } = useUser();

    const { data: Api = [], refetch: fetchservicekey } = useServiceKeys()
    const { data: googleService, refetch: fetchgoogleservice } = useGoogleService()
    const deleteDocsMutation = useDeleteGoogleDocMessage()
    const docs = (googleService as any)?.googledocs ?? []

    const {
        docsurl,
        setdocsurl,
        setModel,
        setProvider,
        model,
        provider,
    } = googleauthstore()

    //States
    const [sessionmessage, setsessionmessage] = useState<chatsession[]>([]);
    const [input, setInput] = useState<string>("");
    const [sending, setSending] = useState(false);
    const [fetch, setloadingfetch] = useState<boolean>(false);
    const serviceemail = (googleService as any)?.email ?? ""
    const loadingdocsdelete = deleteDocsMutation.isPending
    const loadingfetch = fetch || loadingdocsdelete
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [type, settype] = useState<string | null>("text");
    const [opendocs, setopendocs] = useState<boolean>(false);
    const [openservice, setopenservice] = useState<boolean>(false);
    const [useremail, setuseremail] = useState<string>("");
    const [key, setkey] = useState<string>("");
    const [docsinput, setdocsinput] = useState<string>("");
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
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [pendingApproval, setPendingApproval] = useState<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const pendingApprovalRef = useRef<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const threadIdRef = useRef<string | null>(null);
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

            const response = await googleauth.fetchdocsmessage(nextCursor);
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
            await googleauth.senddocsmessage(
                currentInput,
                provider,
                model,
                docsurl ?? "",
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
            const response = await googleauth.fetchdocsmessage()
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

    const adddocsurl = async () => {
        try {
            const response = await googleauth.addgoogledocsurl(docsinput);
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
            setopendocs(false);
            setdocsinput("");
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
            setopendocs(false);
            setdocsinput("");
            setuseremail("");
            setkey("");
        }
    }

    const selecteddocsTitle = useMemo(() => {
        return docs.find((g: any) => g.url === docsurl)?.name || "";
    }, [docsurl, docs]);

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

    const docsmsgdelete = async () => {
        try {
            const response = await deleteDocsMutation.mutateAsync();
            if (response.success) {
                toast.success(response.message);
                setsessionmessage([]);
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
            <ToolApprovalDialog
                open={pendingApproval !== null}
                toolName={pendingApproval?.name || ""}
                toolQuery={pendingApproval?.query || null}
                onApprove={handleApprove}
                onReject={handleReject}
            />
            <Dialog open={opendocs} onOpenChange={setopendocs} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add GoogleDocsUrl</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="docs">Url</Label>
                        <Input id="docs" placeholder="Enter GoogleDocsUrl" value={docsinput} onChange={(e) => setdocsinput(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={adddocsurl}
                            disabled={fetch}
                            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                        > {fetch ? <Spinner /> : "Add"}
                        </Button>
                        <Button variant="destructive" onClick={() => setopendocs
                            (false)}
                        > Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={openservice} onOpenChange={setopenservice} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add Service Account</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Service Email</Label>
                        <Input id="email" placeholder="Enter Service Email" value={useremail} onChange={(e) => setuseremail(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="key">Service Key</Label>
                        <Input id="key" type="password" placeholder="Enter Service Key" value={key} onChange={(e) => setkey(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={addservice}
                            disabled={fetch}
                            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                        > {fetch ? <Spinner /> : "Create"}
                        </Button>
                        <Button variant="destructive" onClick={() => setopenservice(false)}
                        > Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster position="top-right" richColors />
            <div className="flex h-[92vh] w-full flex-col bg-background">
                <GoogleDocsHeader
                    loadingfetch={loadingfetch}
                    serviceemail={serviceemail}
                    Api={Api}
                    apiWithLogos={apiWithLogos}
                    provider={provider}
                    setProvider={setProvider}
                    navigate={navigate}
                />
                <GoogleDocsMessageList
                    sessionmessage={sessionmessage}
                    loadingfetch={loadingfetch}
                    loadingerror={loadingerror}
                    sending={sending}
                    userdata={userdata}
                    loadingMore={loadingMore}
                    copiedIndex={copiedIndex}
                    uploadingImageUrls={uploadingImageUrls}
                    topSentinelRef={topSentinelRef}
                    scrollContainerRef={scrollContainerRef}
                    messagesEndRef={messagesEndRef}
                    fetchMessages={fetchMessages}
                    setCopiedIndex={setCopiedIndex}
                    setLightboxImages={setLightboxImages}
                    setLightboxIndex={setLightboxIndex}
                    setLightboxOpen={setLightboxOpen}
                />
                <GoogleDocsConnectionPanel
                    sessionmessage={sessionmessage}
                    loadingdocsdelete={loadingdocsdelete}
                    docsurl={docsurl}
                    docs={docs}
                    serviceemail={serviceemail}
                    provider={provider}
                    loadingfetch={loadingfetch}
                    selecteddocsTitle={selecteddocsTitle}
                    setdocsurl={setdocsurl}
                    setopendocs={setopendocs}
                    docsmsgdelete={docsmsgdelete}
                />
                <GoogleDocsInput
                    Api={Api}
                    provider={provider}
                    model={model}
                    serviceemail={serviceemail}
                    docs={docs}
                    input={input}
                    setInput={setInput}
                    sending={sending}
                    loadingrecord={loadingrecord}
                    recordstatus={recordstatus}
                    uploadingImages={uploadingImages}
                    pendingImages={pendingImages}
                    setPendingImages={setPendingImages}
                    type={type}
                    settype={settype}
                    modelList={modelList}
                    modelsLoading={modelsLoading}
                    reasoningLevel={reasoningLevel}
                    setReasoningLevel={setReasoningLevel}
                    setModel={setModel}
                    handleSend={handleSend}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
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