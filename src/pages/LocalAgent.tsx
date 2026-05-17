import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BRAND_ASSETS, PROVIDER_MODELS } from "@/features/providermodels";
import { useagentstore } from "@/store/agentauthstore";
import { authservicestore } from "@/store/serviceauthstore";
import { userauthstore } from "@/store/userauthstore";
import { nodes } from "@/types/globaltype";
import { ArrowUp, Bot, BotIcon, EllipsisVertical, Mic, PenBox, Square, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import AiContent from "@/components/ui/LayoutAiresponse";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { agentsession } from "@/types/agenttype";
import { voiceauth } from "@/api/voiceauth";
import { ToolRecord, ToolType } from "@/features/toolsselection";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const LocalAgent = () => {

    //Store
    const {
        userdata,
    } = userauthstore();

    const {
        fetchservicekey,
        Api
    } = authservicestore();

    const {
        Node,
        fetchnode,
        addnode,
        updatenode,
        deletenode,
        loadingfetch,
        loadingnode,
        fetchagentmessages,
        storeagentmessage,
        type,
        settype
    } = useagentstore();


    //States
    const [provider, setprovider] = useState<string | null>(null);
    const [nodes, setnodes] = useState<nodes[]>([]);
    const [open, setopen] = useState<boolean>(false);
    const [openupdate, setopenupdate] = useState<boolean>(false);
    const [opendelete, setopendelete] = useState<boolean>(false);
    const [nodeid, setnodeid] = useState<string>("");
    const [model, setmodel] = useState<string | null>("");
    const [name, setname] = useState<string>("");
    const [actor, setactor] = useState<string>("");
    const [prompt, setprompt] = useState<string>("");
    const [input, setinput] = useState<string>("");
    const [refresh, setrefresh] = useState<boolean>(false);
    const [selectnode, setselectnode] = useState<string | null>("");
    const [firstnode, setfirstnode] = useState<string | null>(null);
    const [lastnode, setlastnode] = useState<string | null>(null);
    const [messageloading, setmessageloading] = useState<boolean>(false);
    const [workflowloading, setworkflowloading] = useState<boolean>(false);
    const [_, setindex] = useState<number>();
    const [history, setHistory] = useState<agentsession[]>([]);
    const [recordstatus, setrecordstatus] = useState<boolean>(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [loadingrecord, setloadingrecord] = useState<boolean>(false);
    const [tool, settool] = useState<string | null>("");

    //Navigate
    const navigate = useNavigate();

    //Functions
    useEffect(() => {
        fetchservicekey();
    }, [])

    useEffect(() => {
        const fetchmessage = async () => {
            try {
                setmessageloading(true);
                const response = await fetchagentmessages();
                if (response.success && response.data) {
                    setHistory(response.data);
                }
            }
            catch (err: unknown) {
                if (err instanceof Error) {
                    const Error = err as any;
                    const error = Error.response?.data?.message || err.message;
                    toast.error(error, {
                        id: "agentmsg-error",
                        description: "There was a problem connecting to the server.",
                        duration: Infinity,
                        action: {
                            label: "Retry",
                            onClick: () => {
                                toast.dismiss("agentmsg-error")
                                fetchmessage()
                            },
                        },
                    });
                } else {
                    toast.error("An unexpected error occurred.")
                }
            }
            finally {
                setmessageloading(false);
            }
        }
        fetchmessage();
    }, [])


    useEffect(() => {
        fetchnode();
    }, [refresh]);

    useEffect(() => {
        if (Node) {
            const Nodes: nodes[] = Node.map((n: any) => ({
                id: n.id,
                name: n.name,
                provider: n.provider,
                actor: n.actor,
                model: n.model,
                tool: n.tool,
                systemPrompt: n.systemprompt,
                output: "",
                thinking: "",
                content: "",
                status: 'idle' as const,
                activeTool: undefined
            }));
            setnodes(Nodes);
        }
    }, [Node]);


    //Update
    const handleupdate = (idx: number) => {
        const nodeToEdit = nodes[idx];
        setindex(idx);
        setnodeid(nodeToEdit.id);
        setname(nodeToEdit.name);
        setactor(nodeToEdit.actor);
        setprompt(nodeToEdit.systemPrompt!);
        setprovider(nodeToEdit.provider);
        setmodel(nodeToEdit.model);
        settool(nodeToEdit.tool);
        setopenupdate(true);
    };

    //Delete
    const handledelete = (idx: number) => {
        const nodeToDelete = nodes[idx];
        setindex(idx);
        setnodeid(nodeToDelete.id);
        setname(nodeToDelete.name);
        setopendelete(true);
    }

    const resetForm = () => {
        setindex(undefined);
        setnodeid("");
        setname("");
        setactor("");
        setprompt("");
        setprovider("");
        setmodel("");
        settool("")
        setopen(false)
        setopenupdate(false)
        setopendelete(false)
    };

    //Add Agent Node
    const Addnode = async () => {
        try {
            if (!name || !provider || !actor || !model || !tool || !prompt) {
                return;
            }
            const response = await addnode(
                name,
                provider,
                actor,
                model,
                tool,
                prompt
            )
            if (response.success) {
                toast.success(response.message);
                setnodeid("");
                setname("");
                setactor("");
                setprompt("");
                setprovider("");
                setmodel("");
                settool("");
                setopen(false);
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

    //Updatenode
    const Updatenode = async () => {
        try {
            if (!name || !provider || !actor || !model || !tool || !prompt) {
                return;
            }
            const response = await updatenode(
                nodeid,
                name,
                provider,
                actor,
                model,
                tool,
                prompt
            )
            if (response.success) {
                toast.success(response.message);
                setnodeid("");
                setname("");
                setactor("");
                setprompt("");
                setprovider("");
                setmodel("");
                settool("");
                setopenupdate(false);
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

    //Deletenode
    const Deletenode = async () => {
        try {
            if (!nodeid) {
                return;
            }
            const response = await deletenode(
                nodeid
            )
            if (response.success) {
                toast.success(response.message);
                setnodeid("");
                setname("");
                setactor("");
                setprompt("");
                setprovider("");
                setmodel("");
                settool("");
                setopendelete(false);
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

    //Response from electron
    useEffect(() => {
        const handleStart = (_: any, data: any) => {
            setnodes((prev) => prev.map(n =>
                n.name === data.nodeName ? { ...n, status: 'running' as const } : n
            ));
        };

        const handleFinished = async (_: any, data: any) => {
            setnodes((prev) => {
                const targetNode = prev.find((n) => n.name === data.nodeName);

                if (targetNode && targetNode.output) {
                    const finalContent = targetNode.output;
                    const Agentname = targetNode.name;

                    setHistory((element) => [...element, {
                        role: "assistant",
                        content: finalContent,
                        name: Agentname
                    }]);

                    storeagentmessage("assistant", finalContent, Agentname);
                }

                const updatedNodes = prev.map((n) =>
                    n.name === data.nodeName ? { ...n, status: "idle" as const } : n
                );

                const isWorkflowStillRunning = updatedNodes.some(n => n.status === 'running');

                if (!isWorkflowStillRunning) {
                    setworkflowloading(false);
                }

                return updatedNodes;
            });
        };
        const handleStream = (_: any, data: any) => {
            setnodes((prev) => prev.map(n =>
                n.name === data.nodeName ? { ...n, output: (n.output || "") + data.chunk } : n
            ));

        };
        //Thinking
        const handleThinking = (_: any, data: any) => {
            setnodes((prev) => prev.map(n =>
                n.name === data.nodeName ? { ...n, thinking: (n.thinking || "") + data.chunk } : n
            ));
        };

        //ToolCalling
        const handleTool = (_: any, data: any) => {
            setnodes((prev) => prev.map(n =>
                n.name === data.nodeName ? { ...n, activeTool: data.toolName } : n
            ));
        };
        const handleToolFinished = (_: any, data: any) => {
            setnodes(prev => prev.map(n =>
                n.name === data.nodeName ? { ...n, activeTool: null } : n
            ));
        };

        const handleError = (_: any) => {

            setworkflowloading(false);

            setnodes((prev) => prev.map(n => ({
                ...n,
                status: 'idle' as const,
                activeTool: null
            })));
        };


        window.ipcRenderer.on('node-stream', handleStream);
        window.ipcRenderer.on('node-thinking', handleThinking);
        window.ipcRenderer.on('node-tool-call', handleTool);
        window.ipcRenderer.on('node-tool-finished', handleToolFinished);
        window.ipcRenderer.on('node-start', handleStart);
        window.ipcRenderer.on('node-finished', handleFinished);
        window.ipcRenderer.on("node-error", handleError)

        return () => {
            window.ipcRenderer.removeAllListeners('node-stream');
            window.ipcRenderer.removeAllListeners('node-thinking');
            window.ipcRenderer.removeAllListeners('node-tool-call');
            window.ipcRenderer.removeAllListeners('node-tool-finished');
            window.ipcRenderer.removeAllListeners('node-start');
            window.ipcRenderer.removeAllListeners('node-finished');
            window.ipcRenderer.removeAllListeners("node-error");
        };
    }, []);


    //Messagesend
    const sendMessage = async () => {
        if (!input || !type || messageloading || workflowloading) {
            return;
        }

        setworkflowloading(true);
        const updatedHistory = [...history, { role: "user", content: input, name: userdata?.username ?? "User" }];
        setHistory(updatedHistory);
        const messageToSave = input;

        setinput("")

        const runningNodes = nodes.map(node => ({
            ...node,
            output: "",
            thinking: "",
            status: 'idle' as const
        }));

        setnodes(runningNodes);

        await storeagentmessage("user", messageToSave, userdata?.username ?? "User");


        if (type === "Linear Sequence") {
            window.ipcRenderer.send('run-workflow', {
                input: updatedHistory,
                nodes: runningNodes,
                encryptkey: Api,
                firstnode: firstnode,
                lastnode: lastnode,
                useremail: userdata?.useremail
            });
        }
        else if (type === "Range Node") {
            window.ipcRenderer.send('run-workflow', {
                input: updatedHistory,
                nodes: runningNodes,
                encryptkey: Api,
                firstnode: firstnode,
                lastnode: lastnode,
                useremail: userdata?.useremail
            });
        }
        else if (type === "Simultaneous") {
            window.ipcRenderer.send('run-workflow', {
                input: updatedHistory,
                nodes: runningNodes,
                encryptkey: Api,
                useremail: userdata?.useremail,
                simultaneous: true
            });
        }
        else {
            window.ipcRenderer.send('run-workflow', {
                input: updatedHistory,
                nodes: runningNodes,
                encryptkey: Api,
                targetnode: selectnode,
                useremail: userdata?.useremail
            });
        }

    }

    const startRecording = async () => {
        if (recordstatus) {
            stopRecording();
            return;
        }

        setinput("");

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
                    setinput(response.transcribe);
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
    //providers
    const availableModels = provider ? PROVIDER_MODELS[provider] || [] : [];

    const apiWithLogos = Api ? Api.map((provider) => ({
        ...provider,
        imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()]
    })) : [];

    return (
        <>
            <Toaster position="top-right" richColors />
            {/*Create*/}
            <Dialog open={open} onOpenChange={(isOpen) => {
                setopen(isOpen)
                if (!isOpen) resetForm()
            }} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add Agent Node</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Add your own ai agent into your workflow.</DialogDescription>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Agent Name</Label>
                        <Input id="name" placeholder="Enter Agent Name" value={name} onChange={(e) => setname(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" placeholder="Enter Agent Role" value={actor} onChange={(e) => setactor(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="prompt">Prompt</Label>
                        <Textarea id="prompt" placeholder="Enter Agent Prompt" className="resize-none h-20" value={prompt} onChange={(e) => setprompt(e.target.value)} />
                    </div>
                    <div className="flex justify-between gap-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="provider">Provider</Label>
                            <Select onValueChange={(value) => {
                                setprovider(value ?? "")
                                setmodel("")
                            }} value={provider}>
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
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="Tool">Tools</Label>
                            <Select id="Tool" onValueChange={(value) => settool(value)} value={tool}>
                                <SelectTrigger >
                                    {tool ? ToolRecord[tool as ToolType] : "Select Tools"}
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ToolRecord).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="model">Models</Label>
                            {Api.length > 0 && (
                                <Select
                                    key={`${provider}-${type}`}
                                    onValueChange={(val) => setmodel(val ?? "")}
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
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={loadingnode} onClick={Addnode} className="bg-cyan-500 dark:bg-card-foreground dark:text-black">{loadingnode ? <Spinner /> : "Add"}</Button>
                        <Button onClick={() => {
                            setopen(false)
                            resetForm();
                        }} variant="destructive">Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*Update*/}
            <Dialog open={openupdate} onOpenChange={(isOpen) => {
                setopenupdate(isOpen);
                if (!isOpen) resetForm();
            }} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Update Agent Node</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Add your own ai agent into your workflow.</DialogDescription>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Agent Name</Label>
                        <Input id="name" placeholder="Enter New Agent" value={name} onChange={(e) => setname(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" placeholder="Enter New Agent Role" value={actor} onChange={(e) => setactor(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="prompt">Prompt</Label>
                        <Textarea id="prompt" placeholder="Enter New Agent Prompt" className="resize-none h-20" value={prompt} onChange={(e) => setprompt(e.target.value)} />
                    </div>
                    <div className="flex justify-between gap-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="provider">Provider</Label>
                            <Select onValueChange={(value) => {
                                setprovider(value ?? "")
                                setmodel("")
                            }} value={provider}>
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
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="Tool">Tools</Label>
                            <Select id="Tool" onValueChange={(value) => settool(value)} value={tool}>
                                <SelectTrigger >
                                    {tool ? ToolRecord[tool as ToolType] : "Select Tools"}
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ToolRecord).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="model">Models</Label>
                            {Api.length > 0 && (
                                <Select
                                    key={`${provider}-${type}`}
                                    onValueChange={(val) => setmodel(val ?? "")}
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
                                                    <span className="text-sm">{m.model.substring(0, 15) + "..."}</span>
                                                </div>
                                            </SelectItem>))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={loadingnode} onClick={Updatenode} className="bg-cyan-500 dark:bg-card-foreground dark:text-black">{loadingnode ? <Spinner /> : "Update"}</Button>
                        <Button onClick={() => {
                            setopenupdate(false)
                            resetForm();
                        }} variant="destructive">Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*Delete*/}
            <Dialog open={opendelete} onOpenChange={(isOpen) => {
                setopendelete(isOpen)
                if (!isOpen) resetForm()
            }} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Agent Node</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Are you sure do you want to delete <span className="font-semibold">"{name}"</span>?</DialogDescription>
                    <DialogFooter>
                        <Button disabled={loadingnode} onClick={Deletenode} className="bg-cyan-500 dark:bg-card-foreground dark:text-black">{loadingnode ? <Spinner /> : "Delete"}</Button>
                        <Button onClick={() => {
                            setopendelete(false);
                            resetForm();
                        }} variant="destructive">Cancel</Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog>

            <div className="flex h-[92vh] w-full flex-col bg-background">
                <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold flex gap-3 items-center">
                            <Bot className="w-6 h-6 text-cyan-500 dark:text-white" />
                            Multimate-MultiAgent</h1>
                        <p className="text-muted-foreground">Ai that does work.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        {messageloading ?
                            <span className="flex items-center gap-2 px-1 py-1 rounded-full border border-transparent">
                                <Skeleton className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                            </span> : <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                Up To Date
                            </Badge>}
                        {(nodes.length > 0 || Api.length > 0) ? <Button onClick={() => setopen(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-white dark:text-black">Add Node</Button> : <Button className="bg-cyan-500 dark:bg-white" onClick={() => navigate("/app/settings")}>Add Provider</Button>}
                    </div>
                </div>
                <div className="flex-1 px-3 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                    <div className="mx-auto max-w-5xl py-5">
                        {loadingfetch ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                    <Card key={i} className="flex flex-col h-30 shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2 w-full">
                                                    <Skeleton className="h-5 w-[60%]" />
                                                    <Skeleton className="h-3 w-[40%]" />
                                                </div>
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ) :
                            nodes && nodes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {nodes.map((element, idx) => {
                                        const isActive = element.status === 'running';
                                        return (
                                            <Card key={idx} className={`flex flex-col h-full hover:border hover:border-cyan-500/50 relative overflow-hidden
                                                ${isActive
                                                    ? "border-cyan-500 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] scale-[1.02] bg-cyan-50/5 dark:bg-cyan-950/10 z-10"
                                                    : "border-border opacity-80"
                                                }`}>
                                                {isActive && (
                                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-[pulse_2s_infinite]" />
                                                )}
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-col gap-2">
                                                            <CardTitle className=" flex items-center gap-2 text-lg max-lg:text-sm">
                                                                <Bot className={`text-cyan-500 dark:text-white ${isActive ? "animate-bounce" : ""}`} />{element.name}
                                                                <p className={`text-[10px] px-2 py-1 rounded-full border transition-all duration-300 ${isActive
                                                                    ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                                                                    : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                                                                    }`}>
                                                                    {isActive ? "ACTIVE" : element.actor}
                                                                </p>
                                                            </CardTitle>
                                                            <CardDescription className="text-xs flex gap-1 items-center">
                                                                <img src={BRAND_ASSETS[element.provider.toLowerCase()]} className="bg-white rounded-lg p-0.5 w-5 h-5" /><span className="font-bold">{element.model}</span>
                                                            </CardDescription>
                                                            <CardDescription className="text-xs">
                                                                Tools: <span className="text-green-500"> {ToolRecord[element.tool as ToolType]} </span>
                                                            </CardDescription>
                                                        </div>
                                                        <CardAction>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger className="dark:hover:bg-zinc-700 hover:bg-black/10 p-1 rounded-full">
                                                                    <EllipsisVertical size={17} className="text-muted-foreground dark:text-white" />
                                                                </DropdownMenuTrigger >
                                                                <DropdownMenuContent side="right" align="start">
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleupdate(idx);
                                                                    }} className="flex ">
                                                                        <PenBox /> Update
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-red-600 flex" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handledelete(idx);
                                                                    }} >
                                                                        <Trash /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </CardAction>
                                                    </div>
                                                </CardHeader>
                                                <div className="px-6 pb-6 flex-1 overflow-y-auto max-h-75 text-sm space-y-3" style={{ scrollbarWidth: "none" }}>
                                                    {element.thinking && (
                                                        <div className="p-3 bg-muted/50 rounded-lg border-l-2 border-cyan-500 text-xs text-muted-foreground italic">
                                                            <span className="block font-bold mb-1 opacity-50">THINKING...</span>
                                                            {element.thinking}
                                                        </div>
                                                    )}

                                                    {element.activeTool && (
                                                        <div className="flex items-center gap-2 text-xs text-amber-500 font-medium animate-pulse">
                                                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                            Using Tool: {element.activeTool}
                                                        </div>
                                                    )}

                                                    <div className="leading-relaxed whitespace-pre-wrap">
                                                        {(element.output || element.activeTool || element.thinking) ? <AiContent content={element.output!} /> :
                                                            <motion.span
                                                                animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                                                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                                style={{
                                                                    backgroundImage: "linear-gradient(90deg, #6b7280 0%, #f3f4f6 50%, #6b7280 100%)",
                                                                    backgroundSize: "200% 100%",
                                                                    WebkitBackgroundClip: "text",
                                                                    WebkitTextFillColor: "transparent",
                                                                }}
                                                                className="italic"
                                                            > Awaiting sequence...
                                                            </motion.span>}
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="min-h-[60vh] flex flex-col justify-center items-center text-center">
                                    <h1 className="text-3xl font-semibold mb-2">Build your Agent Chain</h1>
                                    <p className="text-muted-foreground mb-6">Connect multiple models to solve complex tasks.</p>
                                    {Api.length > 0 ? <Button onClick={() => setopen(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-white dark:text-black">Add First Node</Button> : <Button className="bg-cyan-500 dark:bg-white" onClick={() => navigate("/app/settings")}>Add Provider</Button>}
                                </div>
                            )}
                    </div>
                </div>
                {nodes.length > 0 && <div className="flex w-full gap-2 justify-end mx-auto max-w-5xl mb-3 mt-3">
                    <Select
                        onValueChange={(val) => settype(val ?? "")}
                        value={type}
                    >
                        <SelectTrigger >
                            <span className="truncate">
                                {type ? type.substring(0, 15) + "..." : "Select Mode"}
                            </span>
                        </SelectTrigger>
                        <SelectContent side="top" align="end" className="p-1 w-60">
                            <SelectItem value="Linear Sequence">
                                Linear Sequence
                            </SelectItem>
                            <SelectItem value="Specific Node">
                                Specific Node
                            </SelectItem>
                            <SelectItem value="Range Node">
                                Range Node
                            </SelectItem>
                            <SelectItem value="Simultaneous">
                                Simultaneous
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {type === "Specific Node" && <Select
                        onValueChange={(val) => setselectnode(val)}
                        value={selectnode}
                        disabled={!type}
                    >
                        <SelectTrigger >
                            <span className="truncate">
                                {selectnode ? selectnode.substring(0, 15) + "..." : "Select Agent Node"}
                            </span>
                        </SelectTrigger>
                        <SelectContent className="p-1 w-60">
                            {Node.map((n) => (
                                <SelectItem key={n.id} value={n.name}>
                                    {n.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>}
                    {type === "Range Node" &&
                        <div className="flex items-center">
                            {nodes.length > 1 ?
                                <div className="flex gap-2">
                                    <Select
                                        onValueChange={(val) => setfirstnode(val)}
                                        value={firstnode}
                                        disabled={!type}
                                    >
                                        <SelectTrigger >
                                            <span className="truncate">
                                                {firstnode ? firstnode.substring(0, 15) + "..." : "Select First Agent Node"}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent className="p-1 w-60">
                                            {Node.map((n) => (
                                                <SelectItem key={n.id} value={n.name}>
                                                    {n.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        onValueChange={(val) => setlastnode(val)}
                                        value={lastnode}
                                        disabled={!type}
                                    >
                                        <SelectTrigger >
                                            <span className="truncate">
                                                {lastnode ? lastnode.substring(0, 15) + "..." : "Select Last Agent Node"}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent className="p-1 w-60">
                                            {Node.map((n) => (
                                                <SelectItem key={n.id} value={n.name}>
                                                    {n.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                :
                                <h1 className="text-sm text-red-400">Please Add At least Two nodes.</h1>
                            }
                        </div>
                    }
                </div>
                }
                {nodes.length > 0 && <div className="w-full bg-card mx-auto max-w-5xl rounded-2xl border p-3 shadow-lg">
                    <div className="relative flex flex-col">
                        <Textarea
                            disabled={workflowloading || nodes.length === 0 || messageloading || loadingrecord || recordstatus}
                            value={input}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !messageloading && !workflowloading) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            onChange={(e) => setinput(e.target.value)}
                            placeholder={recordstatus ? "Listening..." : loadingrecord ? "Transcribing..." : "Message..."}
                            className="border-none max-h-50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                        />

                        <div className="flex items-center justify-between gap-2 mt-2">
                            <div className="flex items-center gap-2">
                                <Sheet >
                                    <SheetTrigger asChild>
                                        <Button className="bg-cyan-500 dark:bg-white rounded-full">
                                            History
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right">
                                        <SheetHeader>
                                            <SheetTitle>Chat History</SheetTitle>
                                            <SheetDescription>
                                                View your previous interactions with the agents.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <ScrollArea className="h-[calc(100vh-120px)] mt-4 p-4">
                                            <div className="flex flex-col gap-4">
                                                {history.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground text-center py-10">
                                                        No history yet.
                                                    </p>
                                                ) : (
                                                    history.map((msg, index) => {
                                                        const isUser = msg.role === "user";

                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`group mb-4 flex w-full gap-4 ${isUser ? "flex-row-reverse" : "flex-row"
                                                                    }`}
                                                            >
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-1">
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
                                                                        <Bot className="h-5 w-5 text-cyan-500 dark:text-white relative" />
                                                                    )}
                                                                </div>

                                                                <div
                                                                    className={`flex flex-col gap-1 max-w-[85%] min-w-0 ${isUser ? "items-end text-right" : "items-start text-left"
                                                                        }`}
                                                                >
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                        {isUser ? userdata?.username : msg.name || "Agent"}
                                                                    </span>

                                                                    <div
                                                                        className={`py-2 rounded-2xl leading-relaxed text-[15px] whitespace-pre-wrap w-full overflow-hidden ${isUser
                                                                            ? "bg-muted text-foreground rounded-tr-none p-3"
                                                                            : "bg-transparent text-foreground rounded-tl-none"
                                                                            }`}
                                                                    >
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 5 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ duration: 0.4 }}
                                                                            className="wrap-break-word w-full"
                                                                        >
                                                                            <AiContent content={msg.content} />
                                                                        </motion.div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </SheetContent>
                                </Sheet>
                                {(type === "Specific Node" && selectnode) && (
                                    <div className="inline-flex gap-2 items-center p-1.5 rounded-lg border cursor-pointer transition bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/20">
                                        <span className="text-sm flex items-center gap-2">
                                            {selectnode}
                                            <BotIcon size={18} />
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 justify-end items-center">
                                <Button
                                    disabled={loadingrecord || nodes.length === 0}
                                    onClick={recordstatus ? stopRecording : startRecording}
                                    size="icon"
                                    className="bg-cyan-500 dark:bg-white rounded-full">
                                    {recordstatus ? <Square size={14} className="fill-current" /> :
                                        loadingrecord ? <Spinner /> : <Mic size={14} />}
                                </Button>
                                <Button
                                    onClick={sendMessage}
                                    size="icon"
                                    disabled={!type || !input || nodes.length === 0 || messageloading || workflowloading || loadingrecord || recordstatus}
                                    className="bg-cyan-500 dark:bg-white rounded-full"
                                >
                                    {workflowloading ? <Spinner /> : <ArrowUp size={16} />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>}
            </div >
        </>
    )
}
