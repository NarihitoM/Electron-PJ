import { useEffect, useMemo, useRef, useState } from "react";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { useUser } from "@/features/auth/hooks/useUser";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import { BRAND_ASSETS, getProviderModels } from "@/shared/config/providermodels";
import { chatsession } from "@/shared/types/globaltype";
import { telegramauthstore } from "@/features/telegram/store/store";
import { Server } from "@/shared/config/axioconfig";
import { voiceauth } from "@/features/voice/api/api";
import { chatauth } from "@/features/chat/api/api";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { telegramcrondata, TelegramUserData, TelegramChatEntity, TelegramContactEntity } from "@/features/telegram/types";
import { telegramauth } from "@/features/telegram/api/api";

import { TelegramMessageList } from "@/features/telegram/components/TelegramMessageList";
import { TelegramInput } from "@/features/telegram/components/TelegramInput";
import { TelegramConnectionPanel } from "@/features/telegram/components/TelegramConnectionPanel";
import { TelegramChatHeader } from "@/features/telegram/components/TelegramChatHeader";

export const Telegram = () => {

    //Store
    const { data: userdata } = useUser();

    const { data: Api = [], refetch: fetchservicekey } = useServiceKeys();

    const {
        provider,
        model,
        mode,
        selectedGroupId,
        selectedContactId,
        setmode,
        setSelectedContactId,
        setSelectedGroupId,
        setModel,
        setProvider,
    } = telegramauthstore()

    // Local state (formerly from store)
    const [loadingfetch, setloadingfetch] = useState(false);
    const [loadingverify, setloadingverify] = useState(false);
    const [loading, setloading] = useState(false);
    const [loadingdeletemsg, setloadingdeletemsg] = useState(false);
    const [loadingcroncreate, setloadingcroncreate] = useState(false);
    const [Telegramuserdata, setTelegramUserData] = useState<TelegramUserData | null>(null);
    const [groups, setGroups] = useState<TelegramChatEntity[]>([]);
    const [contacts, setContacts] = useState<TelegramContactEntity[]>([]);

    //States
    const [sessionmessage, setsessionmessage] = useState<chatsession[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [fetch, setfetch] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [type, settype] = useState<string | null>("");
    const [hover, setHover] = useState<boolean>(false);
    const [phonenumber, setphonenumber] = useState<string>("");
    const [countryCode, setCountryCode] = useState<string>("+95");
    const [phonecode, setphonecode] = useState<string>("");
    const [opencreate, setopencreate] = useState<boolean>(false);
    const [openverify, setopenverify] = useState<boolean>(false);
    const [opencron, setopencron] = useState<boolean>(false);
    const [password, setpassword] = useState<string>("");
    const [recordstatus, setrecordstatus] = useState<boolean>(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [loadingrecord, setloadingrecord] = useState<boolean>(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const topSentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastSentInputRef = useRef<string>("");
    const [loadingerror, setloadingerror] = useState<boolean>(false);
    const [pendingApproval, setPendingApproval] = useState<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const pendingApprovalRef = useRef<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const threadIdRef = useRef<string | null>(null);
    const [modelList, setModelList] = useState<ModelEntry[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [cronModelList, setCronModelList] = useState<ModelEntry[]>([]);
    const [modelOpen, setModelOpen] = useState(false);
    const [reasoningLevel, setReasoningLevel] = useState<"" | "low" | "medium" | "high">("");
    const [pendingImages, setPendingImages] = useState<File[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingImageUrls, setUploadingImageUrls] = useState<Set<string>>(new Set());
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const initialTelegramCron: telegramcrondata = {
        isActive: false,
        channel: "",
        chatId: "",
        model: "",
        provider: "",
        message: "",
        crontype: "",
        triggerAt: "",
        timezone: "",
        customSchedule: ""
    };
    const [telegramcron, settelegramcron] = useState<telegramcrondata>(initialTelegramCron);

    const [customDayOfWeek, setCustomDayOfWeek] = useState<number[]>([]);
    const [customDayOfMonth, setCustomDayOfMonth] = useState<number[]>([]);
    const [customMonth, setCustomMonth] = useState<number[]>([]);

    const toggleCustomDayOfWeek = (day: number) => {
        setCustomDayOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };
    const toggleCustomDayOfMonth = (day: number) => {
        setCustomDayOfMonth(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };
    const toggleCustomMonth = (month: number) => {
        setCustomMonth(prev => {
            const next = prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month];
            if (next.length > 0) {
                const maxDays = Math.min(...next.map(m => getDaysInMonth(m)));
                setCustomDayOfMonth(d => d.filter(day => day <= maxDays));
            }
            return next;
        });
    };
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handlecronchange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        settelegramcron((prev) => ({ ...prev, [name]: value }));
    };

    const cronsubmint = async () => {
        try {
            setloadingcroncreate(true);
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const payload = {
                ...telegramcron,
                timezone: userTimezone,
                customSchedule: telegramcron.crontype === "custom"
                    ? JSON.stringify({ dayOfWeek: customDayOfWeek, dayOfMonth: customDayOfMonth, month: customMonth })
                    : ""
            };

            const response = await telegramauth.telegramcroncreate(payload);

            if (response.success) {
                toast.success(response.message);
                setopencron(false);
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
            setloadingcroncreate(false);
        }
    };

    //Functions
    useEffect(() => {
        fetchservicekey();
    }, [])

    useEffect(() => {
        const gettelegramcron = async () => {
            try {
                const response = await telegramauth.telegramcronget();
                if (response.success && response.data) {
                    settelegramcron(response.data);
                } else {
                    settelegramcron(initialTelegramCron);
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
        }

        gettelegramcron();
    }, [])

    useEffect(() => {
        if (telegramcron.customSchedule) {
            try {
                const schedule = JSON.parse(telegramcron.customSchedule);
                setCustomDayOfWeek(schedule.dayOfWeek || []);
                setCustomDayOfMonth(schedule.dayOfMonth || []);
                setCustomMonth(schedule.month || []);
            } catch {
                setCustomDayOfWeek([]);
                setCustomDayOfMonth([]);
                setCustomMonth([]);
            }
        }
    }, [telegramcron.customSchedule])


    useEffect(() => {
        const fetchTelegramAccount = async () => {
            try {
                setloadingfetch(true);
                const response = await telegramauth.fetchtelegramaccount();
                if (response.success && response.data) {
                    setTelegramUserData(response.data);
                    setGroups(response.data.groups ?? []);
                    setContacts(response.data.contacts ?? []);
                }
            } catch {
                // silently fail
            } finally {
                setloadingfetch(false);
            }
        };
        fetchTelegramAccount();
    }, [])


    const fetchMessages = async () => {
        try {
            setfetch(true);
            setloadingerror(false);
            setsessionmessage([]);
            setNextCursor(null);
            setHasMore(false);
            const response = await telegramauth.fetchtelegrammessage()
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
            setfetch(false)
        }
    }

    useEffect(() => {
        fetchMessages();
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

    useEffect(() => {
        if (!telegramcron.provider) return;
        getProviderModels(telegramcron.provider).then(models => {
            setCronModelList(models);
        });
    }, [telegramcron.provider]);

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

            const response = await telegramauth.fetchtelegrammessage(nextCursor);
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

        const targetId =
            mode === "group"
                ? selectedGroupId
                : mode === "contact"
                    ? selectedContactId
                    : "";

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            if (!input.trim()) return;
        }

        if (!input.trim() || !provider || !model)
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
            await telegramauth.sendmessage(
                currentInput,
                provider,
                model,
                targetId ?? "",
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

    //telegramsendcode
    const handlecodesend = async () => {
        try {
            setloading(true);
            const Country = countryCode.replace(/\D/g, "");
            let Local = phonenumber;

            if (Local.startsWith("0")) {
                Local = Local.substring(1);
            }

            const formattedPhoneNumber = `${Country}${Local}`;

            const response = await telegramauth.telegramservicecreate(
                formattedPhoneNumber,
                password
            );
            if (response.success) {
                toast.success(response.message || "Verification Code Has Been Send!")
                setopenverify(true);
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
            setloading(false);
        }
    }

    //verificationcode
    const handleverifycode = async () => {
        try {
            setloadingverify(true);
            const response = await telegramauth.telegramverify(
                phonecode,
            );
            if (response.success) {
                toast.success(response.message || "Verification Successful!")
                setopenverify(false);
                setopencreate(false);
                setopenverify(false);
                setphonenumber("");
                setpassword("")
                setphonecode("")
            }
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
                setopencreate(false);
                setopenverify(false);
                setphonenumber("");
                setpassword("")
                setphonecode("")
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
        finally {
            setloadingverify(false);
        }
    }

    const selectedGroupTitle = useMemo(() => {
        return groups.find(g => g.id === selectedGroupId)?.title || "";
    }, [selectedGroupId, groups]);

    const selectContact = useMemo(() => {
        return contacts.find(c => c.id === selectedContactId)?.name || "";
    }, [selectedContactId, contacts])

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

    const telegrammsgdelete = async () => {
        try {
            setloadingdeletemsg(true);
            const response = await telegramauth.telegrammsgreset();
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
        finally {
            setloadingdeletemsg(false);
        }
    }

    const onCopyMessage = (index: number, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const getDaysInMonth = (monthIndex: number): number => {
        return new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
    };

    //models for each providers
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

            <TelegramConnectionPanel
                opencreate={opencreate}
                setopencreate={setopencreate}
                openverify={openverify}
                setopenverify={setopenverify}
                loading={loading}
                loadingverify={loadingverify}
                phonenumber={phonenumber}
                setphonenumber={setphonenumber}
                countryCode={countryCode}
                setCountryCode={setCountryCode}
                phonecode={phonecode}
                setphonecode={setphonecode}
                password={password}
                setpassword={setpassword}
                handlecodesend={handlecodesend}
                handleverifycode={handleverifycode}
            />

            <div className="flex h-[92vh] w-full flex-col bg-background">
                <TelegramChatHeader
                    loadingfetch={loadingfetch}
                    Telegramuserdata={Telegramuserdata}
                    Api={Api}
                    provider={provider}
                    setProvider={setProvider}
                    apiWithLogos={apiWithLogos}
                />

                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                    <div className="mx-auto max-w-5xl py-5">
                        <TelegramMessageList
                            sessionmessage={sessionmessage}
                            sending={sending}
                            loadingfetch={loadingfetch}
                            fetchLoading={fetch}
                            loadingerror={loadingerror}
                            loadingMore={loadingMore}
                            userdata={userdata}
                            messagesEndRef={messagesEndRef}
                            topSentinelRef={topSentinelRef}
                            scrollContainerRef={scrollContainerRef}
                            copiedIndex={copiedIndex}
                            onCopyMessage={onCopyMessage}
                            onRetry={fetchMessages}
                            onOpenCreate={() => setopencreate(true)}
                            telegramuserdata={!!Telegramuserdata}
                            setLightboxImages={setLightboxImages}
                            setLightboxIndex={setLightboxIndex}
                            setLightboxOpen={setLightboxOpen}
                            uploadingImageUrls={uploadingImageUrls}
                        />
                    </div>
                </div>

                <TelegramInput
                    input={input}
                    setInput={setInput}
                    sending={sending}
                    recordstatus={recordstatus}
                    loadingrecord={loadingrecord}
                    telegramuserdata={!!Telegramuserdata}
                    provider={provider}
                    model={model}
                    mode={mode}
                    type={type || ""}
                    settype={settype}
                    hover={hover}
                    setHover={setHover}
                    Api={Api}
                    pendingImages={pendingImages}
                    setPendingImages={setPendingImages}
                    uploadingImages={uploadingImages}
                    loadingdeletemsg={loadingdeletemsg}
                    sessionmessageLength={sessionmessage.length}
                    groups={groups}
                    contacts={contacts}
                    selectedGroupId={selectedGroupId}
                    selectedContactId={selectedContactId}
                    selectedGroupTitle={selectedGroupTitle}
                    selectContactName={selectContact}
                    setmode={setmode}
                    setSelectedGroupId={setSelectedGroupId}
                    setSelectedContactId={setSelectedContactId}
                    handleSend={handleSend}
                    abortRef={abortControllerRef}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    telegrammsgdelete={telegrammsgdelete}
                    modelList={modelList}
                    modelsLoading={modelsLoading}
                    setModel={setModel}
                    reasoningLevel={reasoningLevel}
                    setReasoningLevel={setReasoningLevel}
                    opencron={opencron}
                    setopencron={setopencron}
                    telegramcron={telegramcron}
                    settelegramcron={settelegramcron}
                    loadingcroncreate={loadingcroncreate}
                    cronsubmint={cronsubmint}
                    cronModelList={cronModelList}
                    setModelOpen={setModelOpen}
                    modelOpen={modelOpen}
                    customDayOfWeek={customDayOfWeek}
                    customDayOfMonth={customDayOfMonth}
                    customMonth={customMonth}
                    toggleCustomDayOfWeek={toggleCustomDayOfWeek}
                    toggleCustomDayOfMonth={toggleCustomDayOfMonth}
                    toggleCustomMonth={toggleCustomMonth}
                    handlecronchange={handlecronchange}
                    apiWithLogos={apiWithLogos}
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
