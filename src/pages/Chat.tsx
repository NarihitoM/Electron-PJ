import { useEffect, useRef, useState } from "react";
import { ArrowUp, ToolCaseIcon, Globe, X, Mic, Square, Dot, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { userauthstore } from "@/store/userauthstore";
import { authservicestore } from "@/store/serviceauthstore";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"
import { BRAND_ASSETS, PROVIDER_MODELS } from "@/features/providermodels";
import { chatauthstore } from "@/store/chatauthstore";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import AiContent from "@/components/ui/LayoutAiresponse";
import { chatsession } from "@/types/globaltype";
import { voiceauth } from "@/api/voiceauth";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Chat = () => {

    //fetchid from url
    const { id } = useParams();
    //Store
    const {
        userdata,
    } = userauthstore();
    const {
        sendmessage,
        fetchmessage,
        model,
        provider,
        setModel,
        setProvider
    } = chatauthstore();
    const {
        Api,
        fetchservicekey
    } = authservicestore()

    //States
    const [sessionmessage, setsessionmessage] = useState<chatsession[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loadingfetch, setloadingfetch] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [type, settype] = useState<string | null>("text");
    const [hover, setHover] = useState(false);
    const [recordstatus, setrecordstatus] = useState<boolean>(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [loadingrecord, setloadingrecord] = useState<boolean>(false);


    //Navigation
    const navigate = useNavigate();

    //Functions
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


    //Send the message to ai
    const handleSend = async () => {
        if (!input.trim() || !provider || !model)
            return;

        setSending(true);
        const userMsg: chatsession = { role: "user", content: input };
        setsessionmessage((prev) => [
            ...prev,
            userMsg,
            { role: "assistant", content: "" }
        ]);

        const currentInput = input;
        setInput("");

        try {
            await sendmessage(
                id as string,
                provider,
                model,
                currentInput,
                type ?? "text",
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
                }
            )
        } catch (err) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setSending(false);
        }
    };

    //fetchthechatmessage
    useEffect(() => {
        const fetchchatmessage = async () => {
            try {
                setloadingfetch(true);
                setSending(false);
                const response = await fetchmessage(
                    id as string
                )
                if (response.success) {
                    setsessionmessage(response.data ?? []);
                }
            }
            catch (err: unknown) {
                if (err instanceof Error) {
                    const Error = err as any;
                    const error = Error.response?.data?.message || err.message;
                    toast.error(error, {
                        id: "chatmsg-error",
                        description: "There was a problem connecting to the server.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("chatmsg-error")
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
            console.log(audioBlob);

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

    //models for each prroviders
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
                            <Bot className="w-6 h-6 text-cyan-500 dark:text-white" />
                            Chatbot</h1>
                        <p className="text-muted-foreground">Your Ai Chatbot and Assistant.</p>
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
                        {
                            loadingfetch ? (
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
                                (sessionmessage && sessionmessage.length > 0 ?
                                    (sessionmessage.map((msg, index) => {
                                        const isUser = msg.role === "user";
                                        const isLastMessage = index === sessionmessage.length - 1;
                                        const username = userdata?.username;
                                        return (
                                            <div
                                                className={`group mb-8 flex w-full gap-4 ${isUser ? "flex-row-reverse" : "flex-row"
                                                    }`}
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full">
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
                                                    className={`flex flex-col gap-1 max-w-[80%] min-w-0 ${isUser ? "items-end text-left" : "items-start text-left"
                                                        }`}
                                                >
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                                        {isUser ? username : ""}
                                                    </span>
                                                    <div
                                                        className={`rounded-2xl leading-relaxed text-[15px] whitespace-pre-wrap w-full overflow-hidden wrap-break-word min-w-0 ${isUser
                                                            ? "bg-muted text-foreground rounded-tr-none p-3"
                                                            : "bg-transparent text-foreground rounded-tl-none"
                                                            }`}
                                                    >
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.4 }}
                                                            className="wrap-break-word p-1"
                                                        >
                                                            <AiContent content={msg.content} />
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })) : (
                                        <div className="min-h-[50vh] flex flex-col gap-2 justify-center items-center">
                                            <h1 className="text-3xl">How can i help you today?</h1>
                                            <p className="text-sm text-muted-foreground">Send Message To Get Started.</p>
                                            {Api.length > 0 ? "" : <Button className="bg-cyan-500 dark:bg-white" onClick={() => navigate("/app/settings")}>Add Provider</Button>}
                                        </div>
                                    ))}


                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
                    <Textarea
                        disabled={Api.length === 0 || !model || !provider || loadingrecord || recordstatus}
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
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant="outline" className="flex gap-1 items-center cursor-pointer">
                                        <ToolCaseIcon size={15} />
                                        <span className="text-sm">Tools</span>
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="start" side="top">
                                    <DropdownMenuItem onClick={() => settype("websearch")}>
                                        <Globe /> Web search
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {type === "websearch" &&
                                <button
                                    onClick={() => {
                                        settype("text");
                                        setHover(false);
                                    }}
                                    disabled={sending}
                                    onMouseEnter={() => setHover(true)}
                                    onMouseLeave={() => setHover(false)}
                                    className="flex gap-1 items-center p-1 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20"
                                >
                                    {hover ? (
                                        <X size={17} className="text-blue-400" />
                                    ) : (
                                        <Globe size={17} className="text-blue-400" />
                                    )}
                                    <span className="text-[13px] text-blue-400">
                                        Search
                                    </span>
                                </button>}
                        </div>
                        <div className="flex gap-2">
                            {Api.length > 0 && (
                                <Select
                                    key={`${provider}-${type}`}
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
                                        {type === "text" && availableModels.map((m: any) => (
                                            <SelectItem key={m.model} value={m.model}>
                                                <div className="flex items-center gap-3">
                                                    <img src={m.imageUrl} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                                    <span className="text-sm">{m.model.substring(0, 25) + "..."}</span>
                                                </div>
                                            </SelectItem>
                                        ))}

                                        {type === "websearch" && availableModels.map((m: any) => (
                                            <SelectItem key={m.model} value={m.model}>
                                                <div className="flex items-center gap-3">
                                                    <img src={m.imageUrl} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                                    <span className="text-sm">{m.model.substring(0, 25) + "..."}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Button
                                disabled={loadingrecord || !model || !provider}
                                onClick={recordstatus ? stopRecording : startRecording}
                                size="icon"
                                className="bg-cyan-500 dark:bg-white rounded-full">
                                {recordstatus ? <Square size={14} className="fill-current" /> :
                                    loadingrecord ? <Spinner /> : <Mic size={14} />}
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={sending || !input.trim() || !model || !provider || loadingrecord || recordstatus}
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
}