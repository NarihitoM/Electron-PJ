import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Bot, Check, CheckCircle2, ChevronDown, Copy, Cpu, Dot, Loader2, Terminal, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Spinner } from "@/shared/components/ui/spinner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { motion } from "framer-motion";
import AiContent from "@/shared/components/layout/LayoutAiresponse";
import ThinkingBlock from "@/shared/components/ui/ThinkingBlock"
import { BRAND_ASSETS } from "@/shared/config/providermodels";
import { Slacktool } from "@/shared/config/toolsselection";
import { extractToolMessage } from "@/shared/utils/toolutils";
import { toast } from "sonner";
import { useUser } from "@/features/auth/hooks/useUser";
import { slackauth } from "../api/api";
import { slackauthstore } from "../store/store";
import { SlackConnectionPanel } from "./SlackConnectionPanel";

export const SlackMessageList = () => {
    const {
        sessionmessage,
        sending,
        uploadingImageUrls,
        setLightboxImages,
        setLightboxIndex,
        setLightboxOpen,
        setsessionmessage,
        setSending,
        nextCursor,
        setNextCursor,
        hasMore,
        setHasMore,
    } = slackauthstore();
    const { data: userdata } = useUser();

    const [loadingfetch, setloadingfetch] = useState(false);
    const [loadingerror, setloadingerror] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const topSentinelRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const isNearBottomRef = useRef(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [sessionmessage, sending]);

    useEffect(() => {
        const el = messagesEndRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            isNearBottomRef.current = entry.isIntersecting;
        }, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isNearBottomRef.current) scrollToBottom();
    }, [sessionmessage]);

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
                toast.error(Error.response?.data?.message || err.message);
            } else {
                toast.error("An unexpected error occurred.");
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

    const fetchMessages = async () => {
        try {
            setloadingfetch(true);
            setloadingerror(false);
            setSending(false);
            setsessionmessage([]);
            setNextCursor(null);
            setHasMore(false);
            const response = await slackauth.fetchslackmessage();
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

    if (loadingfetch) {
        return (
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                <div className="mx-auto max-w-5xl py-5 space-y-8 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col gap-8">
                            <div className="flex w-full gap-4 flex-row-reverse">
                                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                <div className="flex flex-col gap-2 items-end w-full">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-16 w-[60%] rounded-2xl rounded-tr-none" />
                                </div>
                            </div>
                            <div className="flex w-full gap-4 flex-row">
                                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                <div className="flex flex-col gap-2 items-start w-full">
                                    <Skeleton className="h-3 w-24" />
                                    <div className="space-y-2 w-[80%]">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-[90%]" />
                                        <Skeleton className="h-4 w-[40%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (loadingerror) {
        return (
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                <div className="mx-auto max-w-5xl py-5 min-h-[50vh] flex flex-col gap-3 justify-center items-center">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                    <h1 className="text-2xl font-semibold">Failed To Load</h1>
                    <p className="text-sm text-muted-foreground">There was a problem connecting to the server.</p>
                    <Button onClick={fetchMessages} className="bg-cyan-500 dark:bg-white">Retry</Button>
                </div>
            </div>
        );
    }

    if (!sessionmessage || sessionmessage.length === 0) {
        return (
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                <div className="mx-auto max-w-5xl py-5">
                    <SlackConnectionPanel />
                </div>
            </div>
        );
    }

    return (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
            <div className="mx-auto max-w-5xl py-5">
                <div ref={topSentinelRef} className="h-1" />
                {loadingMore && (
                    <div className="flex justify-center py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Spinner className="h-5 w-5 text-cyan-500 dark:text-white" />
                            Loading...
                        </div>
                    </div>
                )}
                {sessionmessage.map((msg, index) => {
                    const isUser = msg.role === "user";
                    const isLastMessage = index === sessionmessage.length - 1;
                    const username = userdata?.username;
                    return (
                        <div
                            key={index}
                            className={`group mb-8 flex w-full gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full mt-1">
                                {isUser ? (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={
                                                userdata?.profileurl
                                                    ? `${userdata.profileurl}?v=${userdata?.useremail}`
                                                    : undefined
                                            }
                                            alt={userdata?.username}
                                        />
                                        <AvatarFallback className="bg-cyan-500 dark:bg-white border text-white dark:text-black">
                                            {userdata?.username.substring(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="relative flex items-center justify-center">
                                        {sending && isLastMessage && !msg.content && (!msg.toolsCall || msg.toolsCall.length === 0 || msg.toolsCall.some((t: any) => t.status === "loading")) ? (
                                            <Dot className="h-15 w-15 ml-2 text-cyan-500 dark:text-white relative animate-pulse" />
                                        ) : msg.provider && BRAND_ASSETS[msg.provider] ? (
                                            <img src={BRAND_ASSETS[msg.provider]} className="w-7 h-7 rounded bg-white dark:bg-card" alt="" />
                                        ) : (
                                            <Bot className="w-7 h-7 text-muted-foreground" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div
                                className={`flex flex-col gap-1 max-w-[80%] min-w-0 ${isUser ? "items-end text-left" : "items-start text-left"}`}
                            >
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                    {isUser ? username : ""}
                                </span>
                                {!isUser && msg.model && (
                                    <span className="text-[10px] font-mono text-muted-foreground/70">
                                        {msg.model}
                                    </span>
                                )}
                                {isUser && msg.images && msg.images.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-1">
                                        {msg.images.map((url, i) => (
                                            <div
                                                key={i}
                                                className="relative w-20 h-20 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => {
                                                    setLightboxImages(msg.images!);
                                                    setLightboxIndex(i);
                                                    setLightboxOpen(true);
                                                }}
                                            >
                                                <img src={url} alt="attached" className="w-full h-full object-cover" />
                                                {uploadingImageUrls.has(url) && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <Loader2 size={20} className="text-white animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!isUser && msg.generatedImages && msg.generatedImages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {msg.generatedImages.map((url, i) => (
                                            <div
                                                key={i}
                                                className="relative rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity max-w-75"
                                                onClick={() => {
                                                    setLightboxImages(msg.generatedImages!);
                                                    setLightboxIndex(i);
                                                    setLightboxOpen(true);
                                                }}
                                            >
                                                <img src={url} alt="generated" className="w-full h-auto object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div
                                    className={`rounded-2xl leading-relaxed text-[15px] whitespace-pre-wrap w-full overflow-hidden ${isUser
                                        ? "bg-muted text-foreground rounded-tr-none p-3"
                                        : "bg-transparent text-foreground rounded-tl-none"
                                    }`}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="wrap-break-word p-1 w-full"
                                    >
                                        {msg.toolsCall?.filter(t => !t.isChain).map((tool) => (
                                            <Collapsible key={tool.id} className="w-full space-y-2">
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" className={`group flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${tool.status === "done"
                                                        ? "text-black dark:text-white shadow-sm"
                                                        : "dark:text-white text-black"
                                                    }`}>
                                                        {tool.status === "loading" && (
                                                            <Spinner className="w-4 h-4 animate-spin text-cyan-500 dark:text-white" />
                                                        )}
                                                        {tool.status === "done" && (
                                                            <CheckCircle2 size={12} className="text-green-500" />
                                                        )}
                                                        {tool.status === "error" && (
                                                            <XCircle size={12} className="text-red-500" />
                                                        )}
                                                        {tool.status === "rejected" && (
                                                            <XCircle size={12} className="text-red-500" />
                                                        )}
                                                        {tool.status === "loading" ? (
                                                            <motion.span
                                                                animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                                                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                                style={{
                                                                    backgroundImage: "linear-gradient(90deg, #6b7280 0%, #f3f4f6 50%, #6b7280 100%)",
                                                                    backgroundSize: "200% 100%",
                                                                    WebkitBackgroundClip: "text",
                                                                    WebkitTextFillColor: "transparent",
                                                                }}
                                                            >
                                                                {Slacktool[tool.name.toLowerCase()]}
                                                            </motion.span>
                                                        ) : (
                                                            <span>
                                                                {Slacktool[tool.name.toLowerCase()]}
                                                            </span>
                                                        )}
                                                        {tool.status !== "loading" && (
                                                            <ChevronDown
                                                                size={15}
                                                                className="ml-1 text-foreground transition-transform duration-300 group-data-[state=open]:rotate-180"
                                                            />
                                                        )}
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className="flex flex-col rounded-xl border border-zinc-100 dark:border-zinc-800 bg-background overflow-hidden shadow-sm max-w-[95%]">
                                                        <div className="border-b dark:border-zinc-800">
                                                            <div className="px-3 py-1.5 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                                <Terminal size={10} className="text-blue-400" />
                                                                <span className="text-[9px] font-medium text-muted-foreground uppercase">Arguments</span>
                                                            </div>
                                                            <div className="p-3 overflow-x-auto scrollbar-hide">
                                                                <pre className="text-[10px] font-mono text-cyan-700 dark:text-cyan-500 whitespace-pre-wrap">
                                                                    {extractToolMessage(tool.query) || JSON.stringify(tool.query, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                        {tool.result && (
                                                            <div className="flex-1 overflow-hidden">
                                                                <div className="px-3 py-1.5 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                                                                    <Cpu size={10} className="text-emerald-400" />
                                                                    <span className="text-[9px] font-medium text-muted-foreground uppercase">Execution</span>
                                                                </div>
                                                                <div className="p-3 max-h-62.5 overflow-y-auto scrollbar-thin" style={{ scrollbarWidth: "none" }}>
                                                                    <pre className="text-[10px] font-mono text-green-700 dark:text-green-500 whitespace-pre-wrap">
                                                                        {typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ))}
                                    </motion.div>
                                    {msg.thinking && <ThinkingBlock thinking={msg.thinking} isStreaming={sending && index === sessionmessage.length - 1} />}
                                    <AiContent content={msg.content} />
                                </div>
                                {msg.content && (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(msg.content);
                                            setCopiedIndex(index);
                                            setTimeout(() => setCopiedIndex(null), 1500);
                                        }}
                                        className={`${copiedIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity p-1 rounded self-end -mt-1`}
                                    >
                                        {copiedIndex === index ? (
                                            <Check className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};
