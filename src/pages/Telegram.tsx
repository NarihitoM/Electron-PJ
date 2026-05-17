import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, ToolCaseIcon, X, Send, Square, Mic, CheckCircle2, ChevronDown, Terminal, Cpu, Dot, RefreshCw, XCircle, Box } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
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
import { telegramauthstore } from "@/store/telegramauthstore";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { voiceauth } from "@/api/voiceauth";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Telegramtool } from "@/features/toolsselection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export const Telegram = () => {

    //Store
    const {
        userdata,
    } = userauthstore();

    const {
        Api,
        fetchservicekey
    } = authservicestore();

    const {
        loadingfetch,
        loadingverify,
        loading,
        sendmessage,
        telegramcreate,
        telegramfetchdata,
        telegramverify,
        telegrammsgreset,
        loadingdeletemsg,
        groups,
        contacts,
        userdata: Telegramuserdata,
        provider,
        model,
        selectedGroupId,
        selectedContactId,
        mode,
        setmode,
        setSelectedContactId,
        setSelectedGroupId,
        setModel,
        setProvider,
        fetchtelegrammessage,
    } = telegramauthstore()

    //States
    const [sessionmessage, setsessionmessage] = useState<chatsession[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [refresh, setrefresh] = useState<boolean>(false);
    const [fetch, setfetch] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [type, settype] = useState<string | null>("");
    const [hover, setHover] = useState<boolean>(false);
    const [phonenumber, setphonenumber] = useState<string>("");
    const [phonecode, setphonecode] = useState<string>("");
    const [opencreate, setopencreate] = useState<boolean>(false);
    const [openverify, setopenverify] = useState<boolean>(false);
    const [password, setpassword] = useState<string>("");
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


    useEffect(() => {
        telegramfetchdata();
    }, [refresh])


    useEffect(() => {
        const fetchtelegrammsg = async () => {
            try {
                setfetch(true);
                const response = await fetchtelegrammessage();
                if (response.success) {
                    setsessionmessage(response.data ?? [])
                }
            }
            catch (err: unknown) {
                if (err instanceof Error) {
                    const Error = err as any;
                    const error = Error.response?.data?.message || err.message;
                    toast.error(error, {
                        id: "telgramsg-error",
                        description: "There was a problem connecting to the server.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("telgramsg-error");
                                fetchtelegrammsg()
                            },
                        },
                    });
                } else {
                    toast.error("An unexpected error occurred.")
                }
            }
            finally {
                setfetch(false)
            }
        }
        fetchtelegrammsg();
    }, [refresh])




    //Smooth Scrolling
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [sessionmessage, sending]);


    //Send the message to ai
    const handleSend = async () => {

        const targetId =
            mode === "group"
                ? selectedGroupId
                : mode === "contact"
                    ? selectedContactId
                    : "";

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
                currentInput,
                provider,
                model,
                targetId ?? "",
                type ?? "",
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
                                query: status.query,
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
                }
            );
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

    //telegramsendcode
    const handlecodesend = async () => {
        try {
            const response = await telegramcreate(
                phonenumber,
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
    }

    //verificationcode
    const handleverifycode = async () => {
        try {
            const response = await telegramverify(
                phonecode,
            );
            if (response.success) {
                toast.success(response.message || "Verification Successful!")
                setopenverify(false);
                setrefresh(prev => !prev);
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

    const telegrammsgdelete = async () => {
        try {
            const response = await telegrammsgreset();
            if (response.success) {
                toast.success(response.message);
                setrefresh(prev => !prev);

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


    //models for each prroviders
    const availableModels = provider ? PROVIDER_MODELS[provider] || [] : [];

    const apiWithLogos = Api ? Api.map((provider) => ({
        ...provider,
        imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()]
    })) : [];

    return (
        <>
            <Toaster position="top-right" richColors />

            {/*Create*/}
            <Dialog open={opencreate} onOpenChange={setopencreate} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl"><Send size={30} className="text-cyan-500 dark:text-white" /> Set Up Telegram Account</DialogTitle>
                    </DialogHeader>
                    {!openverify ? (
                        <>
                            <DialogDescription className="font-semibold">Note: You need to have 2FA enable to continue the service.</DialogDescription>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+95 etc.."
                                    value={phonenumber}
                                    onChange={(e) => setphonenumber(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Include + and country code (e.g. +95)</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    placeholder="Enter your account password"
                                    value={password}
                                    onChange={(e) => setpassword(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="12345"
                                value={phonecode}
                                onChange={(e) => setphonecode(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Enter the code sent to your Telegram app.</p>
                        </div>
                    )}

                    <DialogFooter>
                        {openverify ? (
                            <Button
                                onClick={handleverifycode}
                                disabled={loadingverify}
                                className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                            >
                                {loadingverify ? <Spinner /> : "Verify & Login"}
                            </Button>
                        ) : (
                            <Button
                                onClick={handlecodesend}
                                disabled={loading}
                                className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                            >
                                {loading ? <Spinner /> : "Send Code"}
                            </Button>
                        )}
                        <Button onClick={() => {
                            setopencreate(false)
                            setopenverify(false)
                        }} variant="destructive">Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-[92vh] w-full flex-col bg-background">
                <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold flex items-center gap-3"><img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" className="w-7 h-7" />TelegramAgent</h1>
                        <p className="text-muted-foreground">The Ai That Send Message Without Human Needs.</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        {loadingfetch ?
                            <span className="flex items-center gap-2 px-2 py-1 rounded-full border border-transparent">
                                <Skeleton className="w-4 h-4 rounded-sm bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                                <Skeleton className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                            </span> :
                            Telegramuserdata &&
                            <span className="text-[13px] flex items-center gap-2 px-1 py-1 rounded-full border bg-card">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" className="w-4 h-4" /> {Telegramuserdata.firstName?.substring(0, 10) + "..."}
                            </span>}
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
                </div>
                <div className="flex-1 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                    <div className="mx-auto max-w-5xl py-5">
                        {
                            (loadingfetch || fetch) ? (
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
                                                    className={`flex flex-col gap-1 max-w-[80%] min-w-0 ${isUser ? "items-end text-left" : "items-start text-left"
                                                        }`}
                                                >
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                                        {isUser ? username : ""}
                                                    </span>

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
                                                            <div className="grid grid-cols-1 gap-2 mb-1 w-fit">                                                            {msg.toolsCall?.map((tool) => (
                                                                <Collapsible key={tool.id} className="w-full space-y-2">
                                                                    <CollapsibleTrigger asChild>
                                                                        <Button className={`group flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold transition-all hover:bg-zinc-50 active:scale-95 ${tool.status === "done"
                                                                            ? "text-black dark:text-white border-zinc-100 dark:border-zinc-800 bg-white dark:bg-card shadow-sm"
                                                                            : "bg-zinc-50 dark:text-white border-zinc-100 dark:border-zinc-800 dark:bg-card text-black"
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
                                                                            {Telegramtool[tool.name.toLowerCase()]}
                                                                            <ChevronDown
                                                                                size={15}
                                                                                className="ml-1 text-black dark:text-white transition-transform duration-300 group-data-[state=open]:rotate-180"
                                                                            />
                                                                        </Button>
                                                                    </CollapsibleTrigger>

                                                                    <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-200">
                                                                        <div className="flex flex-col rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm max-w-[95%]">

                                                                            <div className="border-b dark:border-zinc-800">
                                                                                <div className="px-3 py-1.5 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                                                    <Terminal size={10} className="text-blue-400" />
                                                                                    <span className="text-[9px] font-medium text-muted-foreground uppercase">Arguments</span>
                                                                                </div>
                                                                                <div className="p-3 overflow-x-auto scrollbar-hide">
                                                                                    <pre className="text-[10px] font-mono text-cyan-700 dark:text-cyan-500 whitespace-pre-wrap">
                                                                                        {JSON.stringify(tool.query, null, 2)}
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
                                                            </div>
                                                            <AiContent content={msg.content} />
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })) : (
                                        <div className="min-h-[50vh] flex flex-col gap-2 justify-center items-center">
                                            <h1 className="text-3xl">Telegram Agenting</h1>
                                            <p className="text-sm text-muted-foreground">Send Message And Agent Will Handle Everything.</p>
                                            {!Telegramuserdata && <Button className="bg-cyan-500 dark:bg-white" onClick={() => setopencreate(true)}>Add Telegram Account</Button>}
                                        </div>
                                    ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                    <Button onClick={telegrammsgdelete} disabled={sessionmessage.length === 0 || loadingdeletemsg} className="bg-cyan-500 dark:bg-white">{loadingdeletemsg ? <Spinner /> : <><RefreshCw />Reset Chat</>}</Button>
                    <div className="flex gap-2 items-center">
                        {Telegramuserdata && (
                            <>
                                {groups.length > 0 && contacts.length > 0 &&
                                    <Select key="mode"
                                        onValueChange={(val) => {
                                            setmode(val ?? "");
                                            setSelectedGroupId("");
                                            setSelectedContactId("");
                                        }}
                                        value={mode}
                                        disabled={!provider}>
                                        <SelectTrigger >
                                            <span className="truncate">
                                                {mode ? mode : "Select Mode"}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                            <SelectItem value="group">
                                                Group
                                            </SelectItem>
                                            <SelectItem value="contact">
                                                Contact
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                }
                                {mode === "group" && groups.length > 0 &&
                                    <Select
                                        key={selectedGroupId}
                                        onValueChange={(val) => setSelectedGroupId(val ?? "")}
                                        value={selectedGroupId}
                                        disabled={!provider}
                                    >
                                        <SelectTrigger >
                                            <span className="truncate">
                                                {selectedGroupId ? selectedGroupTitle?.substring(0, 15) + "..." : "Select Groups"}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                            {groups.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>}
                                {mode === "contact" && contacts.length > 0 &&
                                    <Select
                                        key={selectedContactId}
                                        onValueChange={(val) => setSelectedContactId(val ?? "")}
                                        value={selectedContactId}
                                        disabled={!provider}
                                    >
                                        <SelectTrigger >
                                            <span className="truncate">
                                                {selectedContactId ? selectContact?.substring(0, 15) + "..." : "Select Contacts"}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                            {contacts.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                }
                            </>
                        )}
                    </div>
                </div>
                <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
                    <Textarea
                        value={input}
                        disabled={Api.length === 0 || !Telegramuserdata || !model || !provider || loadingrecord || recordstatus}
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
                                <DropdownMenuContent align="start" side="top" className="w-45">
                                    <DropdownMenuItem onClick={() => settype("read")}>
                                        <Box /> Read Message
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => settype("readusers")}>
                                        <Box /> Read Chat Members
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => settype("send")}>
                                        <Box /> Send Message
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => settype("getinfo")}>
                                        <Box /> Get info
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {type === "read" &&
                                <button
                                    onClick={() => {
                                        settype("");
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
                                        <Box size={17} className="text-blue-400" />
                                    )}
                                    <span className="text-[13px] text-blue-400">
                                        Read Message
                                    </span>
                                </button>}
                            {type === "readusers" &&
                                <button
                                    onClick={() => {
                                        settype("");
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
                                        <Box size={17} className="text-blue-400" />
                                    )}
                                    <span className="text-[13px] text-blue-400">
                                        Read Chat Members
                                    </span>
                                </button>}
                            {type === "send" && <button
                                onClick={() => {
                                    settype("");
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
                                    <Box size={17} className="text-blue-400" />
                                )}
                                <span className="text-[13px] text-blue-400">
                                    Send Message
                                </span>
                            </button>}
                            {type === "getinfo" &&
                                <button
                                    onClick={() => {
                                        settype("");
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
                                        <Box size={17} className="text-blue-400" />
                                    )}
                                    <span className="text-[13px] text-blue-400">
                                        Get info
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
                                disabled={loadingrecord || !Telegramuserdata || !model || !provider}
                                onClick={recordstatus ? stopRecording : startRecording}
                                size="icon"
                                className="bg-cyan-500 dark:bg-white rounded-full">
                                {recordstatus ? <Square size={14} className="fill-current" /> :
                                    loadingrecord ? <Spinner /> : <Mic size={14} />}
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={sending || !Telegramuserdata || !input.trim() || !model || !provider || loadingrecord || recordstatus}
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