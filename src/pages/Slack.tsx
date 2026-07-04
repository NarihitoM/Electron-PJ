import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import { BRAND_ASSETS, getProviderModels } from "@/shared/config/providermodels";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { chatsession } from "@/shared/types/globaltype";
import { voiceauth } from "@/features/voice/api/api";
import { slackauth } from "@/features/slack/api/api";
import { slackauthstore } from "@/features/slack/store/store";
import { useSlackAccount } from "@/features/slack/hooks/useSlackAccount";
import { useSlackChannels } from "@/features/slack/hooks/useSlackChannels";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { datafetch } from "@/shared/config/tanstackqueryconfig";
import { slackcrondata } from "@/features/slack/types";
import { Server } from "@/shared/config/axioconfig";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { chatauth } from "@/features/chat/api/api";
import { SlackChatHeader } from "@/features/slack/components/SlackChatHeader";
import { SlackMessageList } from "@/features/slack/components/SlackMessageList";
import { SlackInput } from "@/features/slack/components/SlackInput";


export const Slack = () => {

    //Store
    const { data: userdata } = useUser();

    const { data: slackAccount, isLoading: loadingslack } = useSlackAccount()
    useSlackChannels()

    const workspace = (slackAccount as any)?.workspace ?? ""
    const publichannel = (slackAccount as any)?.public ?? []
    const privatechannel = (slackAccount as any)?.private ?? []
    const im = (slackAccount as any)?.im ?? []
    const mpim = (slackAccount as any)?.mpim ?? []

    const [loadingcroncreate, setloadingcroncreate] = useState<boolean>(false)
    const [loadingslackdelmsg, setloadingslackdelmsg] = useState<boolean>(false)

    const {
        provider,
        model,
        setProvider,
        setModel,
    } = slackauthstore();

    const { data: Api = [], refetch: fetchservicekey } = useServiceKeys()

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
    const [refresh, setrefresh] = useState<boolean>(false);
    const [pendingApproval, setPendingApproval] = useState<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const pendingApprovalRef = useRef<{ name: string; query: Record<string, unknown> | null } | null>(null);
    const threadIdRef = useRef<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [type, settype] = useState<string | null>("text");
    const [hover, setHover] = useState(false);
    const [recordstatus, setrecordstatus] = useState<boolean>(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [loadingrecord, setloadingrecord] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState(false);
    const [mode, setmode] = useState<string>("");
    const [opencron, setopencron] = useState<boolean>(false);
    const [channelid, setchannelid] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
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

    const initialSlackCron: slackcrondata = {
        isActive: false,
        channel: "",
        roomId: "",
        workspace: "",
        model: "",
        provider: "",
        message: "",
        crontype: "",
        triggerAt: "",
        timezone: "",
        customSchedule: ""
    };
    const [slackcron, setslackcron] = useState<slackcrondata>(initialSlackCron);

    const [customDayOfWeek, setCustomDayOfWeek] = useState<number[]>([]);
    const [customDayOfMonth, setCustomDayOfMonth] = useState<number[]>([]);
    const [customMonth, setCustomMonth] = useState<number[]>([]);

    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const getDaysInMonth = (monthIndex: number): number => {
        return new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
    };

    const maxDayOfMonth = useMemo(() => {
        if (customMonth.length === 0) return 31;
        return Math.min(...customMonth.map(m => getDaysInMonth(m)));
    }, [customMonth]);

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

    const handlechange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setslackcron((prev) => ({ ...prev, [name]: value }));
    };

    const cronsubmint = async () => {
        try {
            setloadingcroncreate(true);
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const payload = {
                ...slackcron,
                timezone: userTimezone,
                customSchedule: slackcron.crontype === "custom"
                    ? JSON.stringify({ dayOfWeek: customDayOfWeek, dayOfMonth: customDayOfMonth, month: customMonth })
                    : ""
            };

            const response = await slackauth.slackcroncreate(payload);

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
    }

    //Navigation

    const navigate = useNavigate();

    //Functions
    useEffect(() => {
        if (workspace) {
            setslackcron(prev => ({ ...prev, workspace: workspace }));
        }
    }, [workspace]);

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
        if (!slackcron.provider) return;
        getProviderModels(slackcron.provider).then(models => setCronModelList(models));
    }, [slackcron.provider]);

    useEffect(() => {
        fetchservicekey();
    }, [])

    useEffect(() => {
        const getslackcron = async () => {
            try {
                const response = await slackauth.slackcronget();
                if (response.success && response.data) {

                    setslackcron(response.data);
                } else {
                    setslackcron(initialSlackCron);
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

        getslackcron();
    }, [])

    useEffect(() => {
        if (slackcron.customSchedule) {
            try {
                const schedule = JSON.parse(slackcron.customSchedule);
                setCustomDayOfWeek(schedule.dayOfWeek || []);
                setCustomDayOfMonth(schedule.dayOfMonth || []);
                setCustomMonth(schedule.month || []);
            } catch {
                setCustomDayOfWeek([]);
                setCustomDayOfMonth([]);
                setCustomMonth([]);
            }
        }
    }, [slackcron.customSchedule])

    //Smooth Scrolling
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [sessionmessage, sending]);

    //Load older messages (cursor-based pagination)
    const loadMore = async () => {
        if (!nextCursor || !hasMore || loadingMore) return;
        setLoadingMore(true);
        try {
            const container = scrollContainerRef.current;
            const prevScrollHeight = container?.scrollHeight ?? 0;

            const response = await slackauth.fetchslackmessage(nextCursor);
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
    }, [hasMore, loadingMore]);

    useEffect(() => {
        datafetch.invalidateQueries({ queryKey: ["slack"] })
    }, [refresh])


    //Listen from backend to see status
    useEffect(() => {
        let interval: string | number | NodeJS.Timeout | undefined;
        let fallbackTimeout: string | number | NodeJS.Timeout | undefined;
        let pollingDelay = 1000;

        const checkStatus = async () => {
            try {
                const response = await slackauth.slackcheckstatus();
                if (response.success) {
                    setIsChecking(false);
                    await datafetch.invalidateQueries({ queryKey: ["slack"] })
                    setrefresh(prev => !prev);
                    if (interval) clearInterval(interval);
                    if (fallbackTimeout) clearTimeout(fallbackTimeout);
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        };

        const stopPolling = async () => {
            if (interval) clearInterval(interval);
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            try {
                const response = await slackauth.slackcheckstatus();
                if (response.success) {
                    await datafetch.invalidateQueries({ queryKey: ["slack"] })
                    setrefresh(prev => !prev);
                }
            } catch (err) {
                console.error("Final check error", err);
            }
            setIsChecking(false);
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkStatus();
                if (interval) { clearInterval(interval); }
                pollingDelay = 1000;
                interval = setInterval(checkStatus, pollingDelay);
            } else {
                pollingDelay = 5000;
                if (interval) { clearInterval(interval); }
                interval = setInterval(checkStatus, pollingDelay);
            }
        };

        if (isChecking) {
            document.addEventListener('visibilitychange', onVisibilityChange);
            fallbackTimeout = setTimeout(stopPolling, 180000);
            interval = setInterval(checkStatus, pollingDelay);

            return () => {
                document.removeEventListener('visibilitychange', onVisibilityChange);
                if (interval) clearInterval(interval);
                if (fallbackTimeout) clearTimeout(fallbackTimeout);
            };
        }
        return () => {
            if (interval) clearInterval(interval);
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
        };
    }, [isChecking]);



    const connectSlack = async () => {
        const response = await slackauth.slackstate();
        const stateId = response.stateId;
        const clientid = import.meta.env.VITE_SLACK_CLIENT_ID;
        if (!clientid) {
            toast.error("Slack Client ID not configured.");
            return;
        }
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
        const redirecturi = encodeURIComponent(`${backendUrl}/slack/api/callback`);
        const scopes = [
            "channels:history",
            "groups:history",
            "im:history",
            "mpim:history",
            "users:read",
            "chat:write",
            "team:read",
            "channels:read"
            , "groups:read"
            , "mpim:read",
            "im:read"
        ].join(",");

        const url = `https://slack.com/oauth/v2/authorize?client_id=${clientid}&user_scope=${scopes}&redirect_uri=${redirecturi}&state=${stateId}&response_type=code`;
        (window.ipcRenderer as any).openInBrowser(url);
        setIsChecking(true);
    }


    //Send the message to ai
    const handleSend = async () => {
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
            await slackauth.sendmessage(
                currentInput,
                provider,
                model,
                channelid ?? "",
                workspace ?? "",
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
            const response = await slackauth.fetchslackmessage()
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

    const deleteslackmessage = async () => {
        try {
            setloadingslackdelmsg(true);
            const response = await slackauth.deleteslackmsg()
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
            setloadingslackdelmsg(false);
        }
    }



    //Channel
    const selectedPublicchannel = useMemo(() => {
        return publichannel.find((p: any) => p.id === channelid)?.name || "";
    }, [channelid, publichannel])

    const selectedPrivatechannel = useMemo(() => {
        return privatechannel.find((p: any) => p.id === channelid)?.name || "";
    }, [channelid, privatechannel])

    const selectedimchannel = useMemo(() => {
        return im.find((p: any) => p.id === channelid)?.name || "";
    }, [channelid, im])

    const selectedmpimchannel = useMemo(() => {
        return mpim.find((p: any) => p.id === channelid)?.name || "";
    }, [channelid, mpim])


    //Cron
    const selectedPublicchannelcron = useMemo(() => {
        return publichannel.find((p: any) => p.id === slackcron.roomId)?.name || "";
    }, [slackcron.roomId, publichannel])

    const selectedPrivatechannelcron = useMemo(() => {
        return privatechannel.find((p: any) => p.id === slackcron.roomId)?.name || "";
    }, [slackcron.roomId, privatechannel])

    const selectedimchannelcron = useMemo(() => {
        return im.find((p: any) => p.id === slackcron.roomId)?.name || "";
    }, [slackcron.roomId, im])

    const selectedmpimchannelcron = useMemo(() => {
        return mpim.find((p: any) => p.id === slackcron.roomId)?.name || "";
    }, [slackcron.roomId, mpim])





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
                <SlackChatHeader
                    loadingslack={loadingslack}
                    workspace={workspace}
                    Api={Api}
                    provider={provider}
                    setProvider={setProvider}
                    apiWithLogos={apiWithLogos}
                    navigate={navigate}
                />
                <SlackMessageList
                    loadingfetch={loadingfetch}
                    loadingslack={loadingslack}
                    loadingerror={loadingerror}
                    loadingMore={loadingMore}
                    sessionmessage={sessionmessage}
                    sending={sending}
                    userdata={userdata}
                    isChecking={isChecking}
                    connectSlack={connectSlack}
                    fetchMessages={fetchMessages}
                    messagesEndRef={messagesEndRef}
                    topSentinelRef={topSentinelRef}
                    scrollContainerRef={scrollContainerRef}
                    copiedIndex={copiedIndex}
                    setCopiedIndex={setCopiedIndex}
                    uploadingImageUrls={uploadingImageUrls}
                    setLightboxImages={setLightboxImages}
                    setLightboxIndex={setLightboxIndex}
                    setLightboxOpen={setLightboxOpen}
                    workspace={workspace}
                />
                <SlackInput
                    sessionmessage={sessionmessage}
                    pendingImages={pendingImages}
                    setPendingImages={setPendingImages}
                    uploadingImages={uploadingImages}
                    input={input}
                    setInput={setInput}
                    Api={Api}
                    workspace={workspace}
                    model={model}
                    provider={provider}
                    loadingrecord={loadingrecord}
                    recordstatus={recordstatus}
                    handleSend={handleSend}
                    sending={sending}
                    abortControllerRef={abortControllerRef}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    type={type}
                    settype={settype}
                    hover={hover}
                    setHover={setHover}
                    opencron={opencron}
                    setopencron={setopencron}
                    modelList={modelList}
                    modelsLoading={modelsLoading}
                    setModel={setModel}
                    reasoningLevel={reasoningLevel}
                    setReasoningLevel={setReasoningLevel}
                    publichannel={publichannel}
                    privatechannel={privatechannel}
                    im={im}
                    mpim={mpim}
                    mode={mode}
                    setmode={setmode}
                    channelid={channelid}
                    setchannelid={setchannelid}
                    selectedPublicchannel={selectedPublicchannel}
                    selectedPrivatechannel={selectedPrivatechannel}
                    selectedimchannel={selectedimchannel}
                    selectedmpimchannel={selectedmpimchannel}
                    deleteslackmessage={deleteslackmessage}
                    loadingslackdelmsg={loadingslackdelmsg}
                    loadingcroncreate={loadingcroncreate}
                    cronsubmint={cronsubmint}
                    slackcron={slackcron}
                    setslackcron={setslackcron}
                    handlechange={handlechange}
                    apiWithLogos={apiWithLogos}
                    navigate={navigate}
                    cronModelList={cronModelList}
                    modelOpen={modelOpen}
                    setModelOpen={setModelOpen}
                    customDayOfWeek={customDayOfWeek}
                    customDayOfMonth={customDayOfMonth}
                    customMonth={customMonth}
                    toggleCustomDayOfWeek={toggleCustomDayOfWeek}
                    toggleCustomDayOfMonth={toggleCustomDayOfMonth}
                    toggleCustomMonth={toggleCustomMonth}
                    DAY_NAMES={DAY_NAMES}
                    MONTH_NAMES={MONTH_NAMES}
                    maxDayOfMonth={maxDayOfMonth}
                    selectedPublicchannelcron={selectedPublicchannelcron}
                    selectedPrivatechannelcron={selectedPrivatechannelcron}
                    selectedimchannelcron={selectedimchannelcron}
                    selectedmpimchannelcron={selectedmpimchannelcron}
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