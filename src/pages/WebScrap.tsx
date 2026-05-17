import { useEffect, useRef, useState } from "react";
import { ArrowUp, Dot, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { userauthstore } from "@/store/userauthstore";
import { authservicestore } from "@/store/serviceauthstore";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { BRAND_ASSETS, PROVIDER_MODELS } from "@/features/providermodels";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import AiContent from "@/components/ui/LayoutAiresponse";
import { chatsession } from "@/types/globaltype";
import { webscrapstore } from "@/store/webscrapstore";
import { isValidUrl } from "@/utils/urlcheck";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

export const WebScrap = () => {
    //Store
    const {
        userdata
    } = userauthstore();

    const {
        sendmessage,
        fetchweb,
        model,
        setModel,
        provider,
        setProvider,
        deleteweb,
        loadingdelete
    } = webscrapstore();
    const {
        Api,
        fetchservicekey
    } = authservicestore();

    //States
    const [sessionmessage, setsessionmessage] = useState<chatsession[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [refresh,setrefresh] = useState<boolean>(false);
    const [loadingfetch, setloadingfetch] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);


    //Navigation
    const navigate = useNavigate();


    //Functions
    useEffect(() => {
        fetchservicekey();
    }, []);



    useEffect(() => {
        const fetchchatmessage = async () => {
            try {
                setloadingfetch(true);
                const response = await fetchweb()
                if (response.success) {
                    setsessionmessage(response.data ?? []);
                }
            }
            catch (err: unknown) {
                if (err instanceof Error) {
                    const Error = err as any;
                    const error = Error.response?.data?.message || err.message;
                    toast.error(error, {
                        id: "webscrap-error",
                        description: "There was a problem connecting to the server.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("webscrap-error")
                                fetchchatmessage()
                            },
                        },
                    });
                } else {
                    toast.error("An unexpected error occurred.")
                }
            }
            finally {
                setloadingfetch(false);
            }
        }
        fetchchatmessage();
    }, [refresh])



    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [sessionmessage, sending]);

    const handleSend = async () => {
        if (!input.trim() || !provider || !model) {
            return;
        }
        if (!isValidUrl(input)) {
            toast.error("Please provide a valid URL starting with http or https");
            return;
        }

        const usercontent = input.trim();

        setSending(true);
        setsessionmessage((prev) => [
            ...prev,
            { role: "user", content: usercontent },
            { role: "assistant", content: "" }
        ]);
        setInput("");

        try {
            await sendmessage(
                provider,
                model,
                usercontent,
                (chunk: string) => {
                    setsessionmessage((prev) => {
                        const next = [...prev];
                        const lastindex = next.length - 1;

                        if (lastindex >= 0 && next[lastindex].role === "assistant") {
                            next[lastindex] = {
                                ...next[lastindex],
                                content: next[lastindex].content + chunk
                            };
                        }

                        return next;
                    });
                }
            );
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const error = err as any;
                const message = error.response?.data?.message || err.message;
                toast.error(message);
            }
            else {
                toast.error("An unexpected error occurred.");
            }
        }
        finally {
            setSending(false);
        }
    };

    const deletewebscrapmessage = async () => {
        try {
            const response = await deleteweb();
            if (response.success) {
                toast.success(response.message);
                setrefresh(prev => !prev);
            }
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const error = err as any;
                const message = error.response?.data?.message || err.message;
                toast.error(message);
            }
            else {
                toast.error("An unexpected error occurred.");
            }
        }
    }

    //Providers
    const availableModels = provider ? PROVIDER_MODELS[provider] || [] : [];

    const apiWithLogos = Api ? Api.map((provider) => ({
        ...provider,
        imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()]
    })) : [];

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="flex h-[92vh] w-full flex-col bg-background">
                <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold flex gap-3 items-center">
                            <Globe className="w-6 h-6 text-cyan-500 dark:text-white" />
                            Web Scrape Agent
                        </h1>
                        <p className="text-muted-foreground">Send URL and Details Explanation Will Appear.</p>
                    </div>
                    {Api.length > 0 ? (
                        <div className="flex gap-2">
                            <Select onValueChange={(value) => setProvider(value ?? "")} value={provider}>
                                <SelectTrigger >
                                    {provider ?
                                        <>
                                            <img src={BRAND_ASSETS[provider.toLowerCase()]} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                            <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                                        </> : "Select Provider"}
                                </SelectTrigger>
                                <SelectContent>
                                    {apiWithLogos.map((item) => (
                                        <SelectItem key={item.provider} value={item.provider}>
                                            <img src={item.imageUrl} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                            <span>{item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <Button className="bg-cyan-500 dark:bg-white" onClick={() => navigate("/app/settings")}>Add Provider</Button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                    <div className="mx-auto max-w-5xl py-5">
                        {loadingfetch ? (
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
                        ) :
                            (sessionmessage && sessionmessage.length === 0 ? (
                                <div className="min-h-[50vh] flex flex-col gap-2 justify-center items-center text-center">
                                    <h1 className="text-3xl font-semibold mb-2">What should I scrape for you?</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Example: https://example.com summarize key points and pricing.
                                    </p>
                                    {Api.length > 0 ? "" : <Button className="bg-cyan-500 dark:bg-white" onClick={() => navigate("/app/settings")}>Add Provider</Button>}
                                </div>
                            ) : (
                                sessionmessage.map((msg, index) => {
                                    const isUser = msg.role === "user";
                                    const isLastMessage = index === sessionmessage.length - 1;
                                    const username = userdata?.username;

                                    return (
                                        <div
                                            key={`${msg.role}-${index}`}
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
                                                        {sending && isLastMessage && <Dot className="h-15 w-15 text-cyan-500 dark:text-white relative animate-pulse" />}
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className={`flex flex-col gap-1 max-w-[80%] min-w-0 ${isUser ? "items-end text-left" : "items-start text-left"}`}
                                            >
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                                    {isUser ? username : ""}
                                                </span>

                                                <div
                                                    className={`rounded-2xl leading-relaxed text-[15px] whitespace-pre-wrap w-full p-2 overflow-hidden ${isUser
                                                        ? "bg-muted text-foreground rounded-tr-none p-3"
                                                        : "bg-transparent text-foreground rounded-tl-none"
                                                        }`}
                                                >
                                                    <AiContent content={msg.content} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ))}

                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                    <Button onClick={deletewebscrapmessage} disabled={sessionmessage.length === 0 || loadingdelete} className="bg-cyan-500 dark:bg-white">{loadingdelete ? <Spinner /> : <><RefreshCw />Reset Chat </>}</Button>
                </div>
                <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg ">
                    <Textarea
                        disabled={Api.length === 0}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste URL..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="border-none max-h-50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                    />

                    <div className="flex  justify-end gap-2 mt-2">
                        <div className="flex gap-2 ">
                            {Api.length > 0 && (
                                <Select
                                    key={`${provider}`}
                                    onValueChange={(val) => setModel(val ?? "")}
                                    value={model}
                                    disabled={!provider}
                                >
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center gap-2">
                                            {model && (
                                                <img
                                                    src={availableModels.find((m: any) => m.model === model)?.imageUrl}
                                                    className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                                />
                                            )}
                                            <span className="truncate">
                                                {model ? model.substring(0, 15) + "..." : "Select Model"}
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-64">
                                        {availableModels.map((m: any) => (
                                            <SelectItem key={m.model} value={m.model}>
                                                <div className="flex items-center gap-3">
                                                    <img src={m.imageUrl} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" alt="" />
                                                    <span className="text-sm">{m.model.substring(0, 25) + "..."}</span>
                                                </div>
                                            </SelectItem>))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Button
                                onClick={handleSend}
                                disabled={sending || !input.trim() || !provider || !model}
                                size="icon"
                                className="bg-cyan-500 dark:bg-white rounded-full"
                            >
                                <ArrowUp size={16} className={sending ? "animate-pulse" : ""} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
