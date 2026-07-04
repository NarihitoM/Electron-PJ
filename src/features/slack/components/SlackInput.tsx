import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Box, Mic, RefreshCw, Square, Timer, ToolCaseIcon, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/shared/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { Spinner } from "@/shared/components/ui/spinner";
import { ModelSelect } from "@/features/chat/components/ModelSelect";
import { ImagePreview, ImagePicker } from "@/shared/components/ImageUpload";
import { SlackCronScheduler } from "./SlackCronScheduler";
import { toast } from "sonner";
import { BRAND_ASSETS, getProviderModels } from "@/shared/config/providermodels";
import { useNavigate } from "react-router-dom";
import { useSlackAccount } from "../hooks/useSlackAccount";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { slackauth } from "../api/api";
import { chatauth } from "@/features/chat/api/api";
import { voiceauth } from "@/features/voice/api/api";
import { slackauthstore } from "../store/store";
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
            <span className="text-[13px] text-blue-400">
                {label}
            </span>
        </button>
    );
};

export const SlackInput = () => {
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
        mode,
        setMode,
        channelid,
        setChannelid,
        loadingslackdelmsg,
        setLoadingslackdelmsg,
        opencron,
        setOpencron,
        slackcron,
        setSlackcron,
        loadingcroncreate,
        setLoadingcroncreate,
        cronModelList,
        setCronModelList,
        modelOpen,
        setModelOpen,
        customDayOfWeek,
        setCustomDayOfWeek,
        customDayOfMonth,
        setCustomDayOfMonth,
        customMonth,
        setCustomMonth,
    } = slackauthstore();

    const { data: slackAccount } = useSlackAccount();
    const { data: Api = [] } = useServiceKeys();

    const workspace = (slackAccount as any)?.workspace ?? "";
    const publichannel = (slackAccount as any)?.public ?? [];
    const privatechannel = (slackAccount as any)?.private ?? [];
    const im = (slackAccount as any)?.im ?? [];
    const mpim = (slackAccount as any)?.mpim ?? [];

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

    const navigate = useNavigate();

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
        const current = slackauthstore.getState().customDayOfWeek;
        setCustomDayOfWeek(current.includes(day) ? current.filter(d => d !== day) : [...current, day]);
    };
    const toggleCustomDayOfMonth = (day: number) => {
        const current = slackauthstore.getState().customDayOfMonth;
        setCustomDayOfMonth(current.includes(day) ? current.filter(d => d !== day) : [...current, day]);
    };
    const toggleCustomMonth = (month: number) => {
        const current = slackauthstore.getState().customMonth;
        const next = current.includes(month) ? current.filter(m => m !== month) : [...current, month];
        if (next.length > 0) {
            const maxDays = Math.min(...next.map(m => getDaysInMonth(m)));
            const currentDayOfMonth = slackauthstore.getState().customDayOfMonth;
            setCustomDayOfMonth(currentDayOfMonth.filter(d => d <= maxDays));
        }
        setCustomMonth(next);
    };

    const handlechange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setSlackcron((prev) => ({ ...prev, [name]: value }));
    };

    const cronsubmint = async () => {
        try {
            setLoadingcroncreate(true);
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
                setOpencron(false);
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
            setLoadingcroncreate(false);
        }
    };

    useEffect(() => {
        if (workspace) {
            setSlackcron(prev => ({ ...prev, workspace }));
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
        const getslackcron = async () => {
            try {
                const response = await slackauth.slackcronget();
                if (response.success && response.data) {
                    setSlackcron(response.data);
                }
            } catch {
                setSlackcron({
                    isActive: false, channel: "", roomId: "", workspace: "",
                    model: "", provider: "", message: "", crontype: "",
                    triggerAt: "", timezone: "", customSchedule: ""
                });
            }
        };
        getslackcron();
    }, []);

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
    }, [slackcron.customSchedule]);

    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    const scrollToBottom = () => {
        const el = document.querySelector('[data-messages-end]');
        el?.scrollIntoView({ behavior: "auto" });
    };

    const handleSend = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            if (!input.trim()) return;
        }

        if (!input.trim() || !provider || !model) return;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setSending(true);

        const currentInput = input;
        const currentImages = [...pendingImages];
        lastSentInputRef.current = currentInput;
        setInput("");
        setPendingImages([]);

        const blobUrls = currentImages.map(file => URL.createObjectURL(file));

        const userMsg: chatsession = { role: "user", content: currentInput, images: blobUrls.length > 0 ? blobUrls : undefined };
        setsessionmessage((prev) => [
            ...prev,
            userMsg,
            { role: "assistant", content: "", provider, model }
        ]);

        if (blobUrls.length > 0) {
            setUploadingImageUrls(new Set(blobUrls));
        }

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
                        } else if (status.type === "chain" && status.step === "end") {
                            const idx = toolCalls.findIndex(t => t.id === status.id);
                            if (idx !== -1) {
                                toolCalls[idx] = { ...toolCalls[idx], status: "done", output: status.output };
                            }
                        } else if (status.step === "tool_start") {
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
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
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
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const deleteslackmessage = async () => {
        try {
            setLoadingslackdelmsg(true);
            const response = await slackauth.deleteslackmsg();
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
            setLoadingslackdelmsg(false);
        }
    };

    const selectedPublicchannel = useMemo(() => {
        return publichannel.find((p: any) => p.id === channelid)?.name || "";
    }, [channelid, publichannel]);

    const selectedPrivatechannel = useMemo(() => {
        return privatechannel.find((p: any) => p.id === channelid)?.name || "";
    }, [channelid, privatechannel]);

    const selectedimchannel = useMemo(() => {
        return im.find((p: any) => p.id === channelid)?.name || "";
    }, [channelid, im]);

    const selectedmpimchannel = useMemo(() => {
        return mpim.find((p: any) => p.id === channelid)?.name || "";
    }, [channelid, mpim]);

    const apiWithLogos = Api.map((item: any) => ({
        ...item,
        imageUrl: BRAND_ASSETS[item.provider.toLowerCase()] || "",
    }));

    const selectedPublicchannelcron = useMemo(() => {
        return publichannel.find((p: any) => p.id === slackcron.roomId)?.name || "";
    }, [slackcron.roomId, publichannel]);

    const selectedPrivatechannelcron = useMemo(() => {
        return privatechannel.find((p: any) => p.id === slackcron.roomId)?.name || "";
    }, [slackcron.roomId, privatechannel]);

    const selectedimchannelcron = useMemo(() => {
        return im.find((p: any) => p.id === slackcron.roomId)?.name || "";
    }, [slackcron.roomId, im]);

    const selectedmpimchannelcron = useMemo(() => {
        return mpim.find((p: any) => p.id === slackcron.roomId)?.name || "";
    }, [slackcron.roomId, mpim]);

    return (
        <>
            <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                <div className="flex gap-2">
                    <Button onClick={deleteslackmessage} disabled={sessionmessage.length === 0 || loadingslackdelmsg} className="bg-cyan-500 dark:bg-white">
                        {loadingslackdelmsg ? <Spinner /> : <><RefreshCw />Reset Chat</>}
                    </Button>
                    {workspace && (
                        <Button onClick={() => setOpencron(true)} className="bg-cyan-500 dark:bg-white"><Timer />Schedule Message</Button>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    {workspace && (
                        <>
                            {(publichannel.length > 0 || privatechannel.length > 0 || im.length > 0 || mpim.length > 0) && (
                                <Select key="mode"
                                    onValueChange={(val) => {
                                        setMode(val ?? "");
                                        setChannelid("");
                                    }}
                                    value={mode}
                                    disabled={!provider}>
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {mode ? mode : "Select Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        <SelectItem value="Public">Public</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                        <SelectItem value="Direct message">Direct Message</SelectItem>
                                        <SelectItem value="Group message">Group Message</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            {mode === "Public" && publichannel.length > 0 && (
                                <Select
                                    key={channelid}
                                    onValueChange={(val) => setChannelid(val ?? "")}
                                    value={channelid}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {channelid ? selectedPublicchannel?.substring(0, 15) + "..." : "Select Public Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {publichannel.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {mode === "Private" && privatechannel.length > 0 && (
                                <Select
                                    key={channelid}
                                    onValueChange={(val) => setChannelid(val ?? "")}
                                    value={channelid}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {channelid ? selectedPrivatechannel?.substring(0, 15) + "..." : "Select Private Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {privatechannel.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {mode === "Direct message" && im.length > 0 && (
                                <Select
                                    key={channelid}
                                    onValueChange={(val) => setChannelid(val ?? "")}
                                    value={channelid}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {channelid ? selectedimchannel?.substring(0, 15) + "..." : "Select Direct Message Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {im.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {mode === "Group message" && mpim.length > 0 && (
                                <Select
                                    key={channelid}
                                    onValueChange={(val) => setChannelid(val ?? "")}
                                    value={channelid}
                                    disabled={!provider}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {channelid ? selectedmpimchannel?.substring(0, 15) + "..." : "Select Direct Message Channel"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                        {mpim.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </>
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
                    disabled={Api.length === 0 || !workspace || !model || !provider || loadingrecord || recordstatus}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={recordstatus ? "Listening..." : loadingrecord ? "Transcribing..." : "Message..."}
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
                            disabled={Api.length === 0 || !workspace || !model || !provider || loadingrecord || recordstatus}
                            maxImages={4}
                        />
                        <SlackCronScheduler
                            opencron={opencron}
                            setopencron={setOpencron}
                            slackcron={slackcron}
                            setslackcron={setSlackcron}
                            handlechange={handlechange}
                            loadingcroncreate={loadingcroncreate}
                            cronsubmint={cronsubmint}
                            publichannel={publichannel}
                            privatechannel={privatechannel}
                            im={im}
                            mpim={mpim}
                            workspace={workspace}
                            Api={Api}
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
                                <DropdownMenuItem onClick={() => settype("getuser")}>
                                    <Box /> Get Userinfo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => settype("getteam")}>
                                    <Box /> Get Teaminfo
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {type === "send" && <ToolButton label="Send Message" settype={settype} sending={sending} />}
                        {type === "read" && <ToolButton label="Read Message" settype={settype} sending={sending} />}
                        {type === "listconversation" && <ToolButton label="List Channels" settype={settype} sending={sending} />}
                        {type === "getuser" && <ToolButton label="Get Userinfo" settype={settype} sending={sending} />}
                        {type === "getteam" && <ToolButton label="Get Teaminfo" settype={settype} sending={sending} />}
                    </div>
                    <div className="flex gap-2">
                        {Api.length > 0 && (
                            <ModelSelect modelList={modelList} provider={provider || ""} model={model} loading={modelsLoading} disabled={!provider} onSelect={setModel} reasoningLevel={reasoningLevel} onReasoningLevelChange={setReasoningLevel} />
                        )}
                        <Button
                            disabled={loadingrecord || !workspace || !model || !provider}
                            onClick={recordstatus ? stopRecording : startRecording}
                            size="icon"
                            className="bg-cyan-500 dark:bg-white rounded-full">
                            {recordstatus ? <Square size={14} className="fill-current" /> :
                                loadingrecord ? <Spinner /> : <Mic size={14} />}
                        </Button>
                        <Button
                            onClick={sending ? () => abortControllerRef.current?.abort() : handleSend}
                            disabled={!sending && (uploadingImages || !workspace || (!input.trim() && pendingImages.length === 0) || !model || !provider || loadingrecord || recordstatus)}
                            size="icon"
                            className={sending ? "bg-red-500 hover:bg-red-600 rounded-full" : "bg-cyan-500 dark:bg-white rounded-full"}
                        >
                            {sending ? <Square size={16} className="fill-current" /> : <ArrowUp size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
