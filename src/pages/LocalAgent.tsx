import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useAgentNodes } from "@/features/agent/hooks/useAgentNodes";
import { useCreateAgentNode } from "@/features/agent/hooks/useCreateAgentNode";
import { useDeleteAgentNode } from "@/features/agent/hooks/useDeleteAgentNode";
import { useResetAgentMessages } from "@/features/agent/hooks/useResetAgentMessages";
import { useagentstore } from "@/features/agent/store/store";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useUser } from "@/features/auth/hooks/useUser";
import { nodes } from "@/shared/types/globaltype";
import { Mail, PenBox, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { agentsession } from "@/features/agent/types";
import { voiceauth } from "@/features/voice/api/api";
import { toolToRole } from "@/shared/config/toolsselection";
import { agentauth } from "@/features/agent/api/api";
import { useEmailCreds } from "@/features/email/hooks/useEmailCreds";
import { useSaveEmailCreds } from "@/features/email/hooks/useSaveEmailCreds";
import { useRemoveEmailCreds } from "@/features/email/hooks/useRemoveEmailCreds";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { AgentNodeList } from "@/features/agent/components/AgentNodeList";
import { AgentChatArea } from "@/features/agent/components/AgentChatArea";
import { AgentInput } from "@/features/agent/components/AgentInput";
import { AgentNodeForm } from "@/features/agent/components/AgentNodeForm";
import { AgentChatHeader } from "@/features/agent/components/AgentChatHeader";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import { getProviderModels } from "@/shared/config/providermodels";

export const LocalAgent = () => {

    //Store
    const { data: userdata } = useUser();

    const { data: Api = [], refetch: fetchservicekey } = useServiceKeys();

    const { data: nodesData, isLoading: loadingfetch } = useAgentNodes()
    const createNodeMutation = useCreateAgentNode()
    const deleteNodeMutation = useDeleteAgentNode()
    const resetMsgMutation = useResetAgentMessages()

    const Node = nodesData ?? []
    const loadingnode = createNodeMutation.isPending
    const loadingresetmsg = resetMsgMutation.isPending
    const {
        type,
        setType: settype,
    } = useagentstore()


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
    const [toolOpen, settoolOpen] = useState(false);
    const [modelOpen, setModelOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [credDialogOpen, setCredDialogOpen] = useState(false);
    const [credHost, setCredHost] = useState("");
    const [credPort, setCredPort] = useState(587);
    const [credUser, setCredUser] = useState("");
    const [credPass, setCredPass] = useState("");
    const { data: credData, refetch: fetchCreds } = useEmailCreds();
    const saveCredsMutation = useSaveEmailCreds();
    const removeCredsMutation = useRemoveEmailCreds();
    const credExists = credData?.exists ?? false;
    const creds = credData?.data ?? null;
    const [credSaving, setCredSaving] = useState(false);
    const [credDeleting, setCredDeleting] = useState(false);
    const [historyNextCursor, setHistoryNextCursor] = useState<string | null>(null);
    const [historyHasMore, setHistoryHasMore] = useState(false);
    const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
    const [historyError, setHistoryError] = useState<boolean>(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [modelList, setModelList] = useState<ModelEntry[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const topSentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const workflowGenRef = useRef(0);
    const lastSentInputRef = useRef<string>("");
    const historyEndRef = useRef<HTMLDivElement | null>(null);
    const [pendingToolApproval, setPendingToolApproval] = useState<{ nodeName: string; toolName: string; args: Record<string, unknown> } | null>(null);

    //Navigate
    const navigate = useNavigate();

    //Functions
    useEffect(() => {
        fetchservicekey();
        fetchCreds();
    }, [])

    // Auto-set role when tool changes
    useEffect(() => {
        if (tool) {
            setactor(toolToRole(tool));
        }
    }, [tool]);

    // Cleanup on unmount — abort running workflow
    useEffect(() => {
        return () => {
            window.ipcRenderer.send('cancel-workflow');
        };
    }, []);

    const fetchMessages = async () => {
        try {
            setmessageloading(true);
            setHistoryError(false);
            setHistoryNextCursor(null);
            setHistoryHasMore(false);
            const response = await agentauth.fetchagentmessages();
            if (response.success && response.data) {
                setHistory((response.data.messages ?? []).reverse());
                setHistoryNextCursor(response.data.nextCursor);
                setHistoryHasMore(response.data.hasMore);
            }
        }
        catch (err: unknown) {
            setHistoryError(true);
            if (err instanceof Error) {
                const Error = err as any;
                toast.error(Error.response?.data?.message || err.message);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
        finally {
            setmessageloading(false);
        }
    }

    useEffect(() => {
        fetchMessages();
    }, [])

    const scrollHistoryToBottom = () => {
        historyEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollHistoryToBottom();
    }, [history]);


    useEffect(() => {
        if (!provider) { setModelList([]); return; }
        setModelsLoading(true);
        getProviderModels(provider!).then(models => {
            setModelList(models);
            setModelsLoading(false);
            if (models.length > 0 && model && !models.some((m: any) => m.model === model)) {
                setmodel(models[0].model);
            }
        });
    }, [provider]);

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
            const response = await createNodeMutation.mutateAsync({ name, provider: provider!, actor, model: model!, tool: tool!, prompt })
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
            const response = await agentauth.updatenode(
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
            const response = await deleteNodeMutation.mutateAsync(nodeid);
            if (!response.success) return;

            toast.success(response.message);

            // Also delete this node's conversation history
            if (name) {
                await agentauth.resetagentmessages(name);
                setHistory(prev => prev.filter(msg => msg.name !== name));
            }

            setnodeid("");
            setname("");
            setactor("");
            setprompt("");
            setprovider("");
            setmodel("");
            settool("");
            setopendelete(false);
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
            if (!data?.nodeName) return;
            const gen = workflowGenRef.current;
            setnodes((prev) => {
                if (workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, status: 'running' as const } : n
                );
            });
        };

        const handleFinished = async (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = workflowGenRef.current;
            setnodes((prev) => {
                if (workflowGenRef.current !== gen) return prev;
                const targetNode = prev.find((n) => n.name === data.nodeName);

                if (targetNode) {
                    const Agentname = targetNode.name;
                    const finalContent = targetNode.output || targetNode.thinking || "";

                    if (finalContent) {
                        setHistory((element) => [...element, {
                            role: "assistant",
                            content: finalContent,
                            name: Agentname,
                            provider: targetNode.provider,
                            model: targetNode.model
                        }]);

                        agentauth.storeagentmessage("assistant", finalContent, Agentname, targetNode.provider, targetNode.model);
                    }
                }

                const updatedNodes = prev.map((n: any) =>
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
            if (!data?.nodeName) return;
            const gen = workflowGenRef.current;
            setnodes((prev) => {
                if (workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, output: (n.output || "") + data.chunk } : n
                );
            });

        };
        //Thinking
        const handleThinking = (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = workflowGenRef.current;
            setnodes((prev) => {
                if (workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, thinking: (n.thinking || "") + data.chunk } : n
                );
            });
        };

        //ToolCalling
        const handleTool = (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = workflowGenRef.current;
            setnodes((prev) => {
                if (workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, activeTool: data.toolName } : n
                );
            });
        };
        const handleToolFinished = (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = workflowGenRef.current;
            setnodes(prev => {
                if (workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, activeTool: null } : n
                );
            });
        };

        const handleError = (_: any, data: { message?: string }) => {
            const gen = workflowGenRef.current;
            setworkflowloading(false);
            if (data?.message) {
                toast.error("Workflow Error", { description: data.message });
            }
            setnodes((prev) => {
                if (workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) => ({
                    ...n,
                    status: 'idle' as const,
                    activeTool: null
                }));
            });
        };

        const handleToolApprovalRequest = (_: any, data: { nodeName: string; toolName: string; args: Record<string, unknown> }) => {
            setPendingToolApproval(data);
        };


        window.ipcRenderer.on('node-stream', handleStream);
        window.ipcRenderer.on('node-thinking', handleThinking);
        window.ipcRenderer.on('node-tool-call', handleTool);
        window.ipcRenderer.on('node-tool-finished', handleToolFinished);
        window.ipcRenderer.on('node-start', handleStart);
        window.ipcRenderer.on('node-finished', handleFinished);
        window.ipcRenderer.on("node-error", handleError);
        window.ipcRenderer.on("tool-approval-request", handleToolApprovalRequest);

        return () => {
            window.ipcRenderer.removeAllListeners('node-stream');
            window.ipcRenderer.removeAllListeners('node-thinking');
            window.ipcRenderer.removeAllListeners('node-tool-call');
            window.ipcRenderer.removeAllListeners('node-tool-finished');
            window.ipcRenderer.removeAllListeners('node-start');
            window.ipcRenderer.removeAllListeners('node-finished');
            window.ipcRenderer.removeAllListeners("node-error");
            window.ipcRenderer.removeAllListeners("tool-approval-request");
        };
    }, []);

    const handleToolApprovalResponse = (approved: boolean) => {
        window.ipcRenderer.send('tool-approval-response', { approved });
        setPendingToolApproval(null);
    };

    //Messagesend
    const sendMessage = async () => {
        if (!input || messageloading) {
            return;
        }

        if (workflowloading) {
            window.ipcRenderer.send('cancel-workflow');
            if (!input) return;
        }

        if (!input || !type || messageloading) {
            return;
        }

        workflowGenRef.current++;

        setworkflowloading(true);

        const newMsg = { role: "user", content: input, name: userdata?.username ?? "User" } as const;
        const updatedHistory = [...history, newMsg];
        setHistory(updatedHistory);

        // Scope agent memory: only include user messages + target agent's own history
        let agentNames: string[];
        if (type === "Specific Node" && selectnode) {
            agentNames = [selectnode];
        } else if ((type === "Linear Sequence" || type === "Range Node") && firstnode && lastnode) {
            const idxA = nodes.findIndex(n => n.name === firstnode);
            const idxB = nodes.findIndex(n => n.name === lastnode);
            const start = Math.min(idxA, idxB);
            const end = Math.max(idxA, idxB);
            agentNames = nodes.slice(start, end + 1).map((n: any) => n.name);
        } else {
            agentNames = nodes.map((n: any) => n.name);
        }
        const agentHistory = history.filter(msg =>
            msg.role === "user" || agentNames.includes(msg.name)
        );
        const workflowInput = [...agentHistory, newMsg];

        const messageToSave = input;
        lastSentInputRef.current = input;

        setinput("")

        const runningNodes = nodes.map(node => ({
            ...node,
            output: "",
            thinking: "",
            status: 'idle' as const
        }));

        setnodes(runningNodes);

        await agentauth.storeagentmessage("user", messageToSave, type === "Specific Node" && selectnode ? selectnode : userdata?.username ?? "User", undefined, undefined);


        if (type === "Linear Sequence") {
            window.ipcRenderer.send('run-workflow', {
                input: workflowInput,
                nodes: runningNodes,
                encryptkey: Api,
                firstnode: firstnode,
                lastnode: lastnode,
                useremail: userdata?.useremail
            });
        }
        else if (type === "Range Node") {
            window.ipcRenderer.send('run-workflow', {
                input: workflowInput,
                nodes: runningNodes,
                encryptkey: Api,
                firstnode: firstnode,
                lastnode: lastnode,
                useremail: userdata?.useremail
            });
        }
        else if (type === "Simultaneous") {
            window.ipcRenderer.send('run-workflow', {
                input: workflowInput,
                nodes: runningNodes,
                encryptkey: Api,
                useremail: userdata?.useremail,
                simultaneous: true
            });
        }
        else {
            window.ipcRenderer.send('run-workflow', {
                input: workflowInput,
                nodes: runningNodes,
                encryptkey: Api,
                targetnode: selectnode,
                useremail: userdata?.useremail
            });
        }

    }

    const abortWorkflow = () => {
        window.ipcRenderer.send('cancel-workflow');
        setworkflowloading(false);
        setnodes((prev) => prev.map((n: any) => ({
            ...n,
            output: "",
            thinking: "",
            status: 'idle' as const,
            activeTool: null
        })));
        setinput(lastSentInputRef.current);
    };

    //Reset history
    const handleResetHistory = async () => {
        const response = await resetMsgMutation.mutateAsync(undefined);
        if (response.success) {
            setHistory([]);
            setHistoryNextCursor(null);
            setHistoryHasMore(false);
            toast.success(response.message);
        }
    };

    //Load older history (cursor-based pagination)
    const loadMoreHistory = async () => {
        if (!historyNextCursor || !historyHasMore || historyLoadingMore) return;
        setHistoryLoadingMore(true);
        try {
            const container = scrollContainerRef.current;
            const prevScrollHeight = container?.scrollHeight ?? 0;

            const response = await agentauth.fetchagentmessages(historyNextCursor);
            if (response.success && response.data) {
                const data = response.data;
                setHistory(prev => [...(data.messages ?? []).reverse(), ...prev]);
                setHistoryNextCursor(data.nextCursor);
                setHistoryHasMore(data.hasMore);

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
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setHistoryLoadingMore(false);
        }
    };

    //IntersectionObserver for infinite scroll up
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && historyHasMore && !historyLoadingMore) {
                loadMoreHistory();
            }
        }, { threshold: 0.1 });

        const el = topSentinelRef.current;
        if (el) observer.observe(el);

        return () => observer.disconnect();
    }, [historyHasMore, historyLoadingMore]);

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
    const servicesContent = (
        <ScrollArea className="h-[calc(100vh-140px)] mt-6 p-4">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <Mail size={18} className="text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Email SMTP</p>
                            <p className="text-xs text-muted-foreground">{credExists ? creds?.smtp_user : "Not configured"}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                if (credExists && creds) {
                                    setCredHost(creds.smtp_host);
                                    setCredPort(creds.smtp_port || 587);
                                    setCredUser(creds.smtp_user);
                                    setCredPass(creds.smtp_pass);
                                }
                                setCredDialogOpen(true);
                            }}
                        >
                            <PenBox size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" disabled={credDeleting} onClick={async () => {
                            setCredDeleting(true);
                            await removeCredsMutation.mutateAsync();
                            setCredDeleting(false);
                            toast.success("Email credentials deleted.");
                        }} className="text-red-500 hover:text-red-600">
                            {credDeleting ? <Spinner className="size-4" /> : <Trash size={14} />}
                        </Button>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );

    const historyContent = (
        <AgentChatArea
            history={history}
            nodes={nodes}
            userdata={userdata}
            historyLoadingMore={historyLoadingMore}
            historyError={historyError}
            historyHasMore={historyHasMore}
            topSentinelRef={topSentinelRef}
            historyEndRef={historyEndRef}
            scrollContainerRef={scrollContainerRef}
            onRetryLoad={fetchMessages}
            copiedIndex={copiedIndex}
            setCopiedIndex={setCopiedIndex}
        />
    );

    return (
        <>
            <Toaster position="top-right" richColors />
            <ToolApprovalDialog
                open={pendingToolApproval !== null}
                toolName={pendingToolApproval?.toolName || ""}
                toolQuery={pendingToolApproval?.args || null}
                onApprove={() => handleToolApprovalResponse(true)}
                onReject={() => handleToolApprovalResponse(false)}
            />

            <AgentNodeForm
                mode="create"
                open={open}
                onOpenChange={(isOpen) => {
                    setopen(isOpen);
                    if (!isOpen) resetForm();
                }}
                name={name}
                setName={setname}
                actor={actor}
                prompt={prompt}
                setPrompt={setprompt}
                provider={provider}
                setProvider={setprovider}
                model={model}
                setModel={setmodel}
                tool={tool}
                setTool={settool}
                toolOpen={toolOpen}
                setToolOpen={settoolOpen}
                modelOpen={modelOpen}
                setModelOpen={setModelOpen}
                modelList={modelList}
                modelsLoading={modelsLoading}
                Api={Api}
                loadingnode={loadingnode}
                onSubmit={Addnode}
                onNavigateSettings={() => navigate("/app/settings")}
            />

            <AgentNodeForm
                mode="update"
                open={openupdate}
                onOpenChange={(isOpen) => {
                    setopenupdate(isOpen);
                    if (!isOpen) resetForm();
                }}
                name={name}
                setName={setname}
                actor={actor}
                prompt={prompt}
                setPrompt={setprompt}
                provider={provider}
                setProvider={setprovider}
                model={model}
                setModel={setmodel}
                tool={tool}
                setTool={settool}
                toolOpen={toolOpen}
                setToolOpen={settoolOpen}
                modelOpen={modelOpen}
                setModelOpen={setModelOpen}
                modelList={modelList}
                modelsLoading={modelsLoading}
                Api={Api}
                loadingnode={loadingnode}
                onSubmit={Updatenode}
                onNavigateSettings={() => navigate("/app/settings")}
            />

            <AgentNodeForm
                mode="delete"
                open={opendelete}
                onOpenChange={(isOpen) => {
                    setopendelete(isOpen);
                    if (!isOpen) resetForm();
                }}
                name={name}
                setName={setname}
                actor={actor}
                prompt={prompt}
                setPrompt={setprompt}
                provider={provider}
                setProvider={setprovider}
                model={model}
                setModel={setmodel}
                tool={tool}
                setTool={settool}
                toolOpen={toolOpen}
                setToolOpen={settoolOpen}
                modelOpen={modelOpen}
                setModelOpen={setModelOpen}
                modelList={modelList}
                modelsLoading={modelsLoading}
                Api={Api}
                loadingnode={loadingnode}
                onSubmit={Deletenode}
                onNavigateSettings={() => navigate("/app/settings")}
            />

            <Dialog open={credDialogOpen} onOpenChange={(isOpen) => {
                setCredDialogOpen(isOpen);
                if (!isOpen) { setCredHost(""); setCredPort(587); setCredUser(""); setCredPass(""); }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Email SMTP Configuration</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Configure your SMTP credentials to enable email sending.</DialogDescription>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="credHost">SMTP Host</Label>
                        <Input id="credHost" placeholder="smtp.gmail.com" value={credHost} onChange={(e) => setCredHost(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="credPort">SMTP Port</Label>
                        <Input id="credPort" type="number" placeholder="587" value={credPort} onChange={(e) => setCredPort(Number(e.target.value))} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="credUser">SMTP Username</Label>
                        <Input id="credUser" placeholder="your@email.com" value={credUser} onChange={(e) => setCredUser(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="credPass">SMTP Password</Label>
                        <Input id="credPass" type="password" placeholder="App password or SMTP password" value={credPass} onChange={(e) => setCredPass(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button disabled={credSaving} onClick={async () => {
                            setCredSaving(true);
                            const result = await saveCredsMutation.mutateAsync({ smtp_host: credHost, smtp_port: credPort, smtp_user: credUser, smtp_pass: credPass });
                            setCredSaving(false);
                            if (result.success) { setCredDialogOpen(false); toast.success("Email credentials saved!"); }
                            else { toast.error("Failed to save email credentials."); }
                        }} className="bg-cyan-500 dark:bg-card-foreground dark:text-black">{credSaving ? <Spinner /> : "Save"}</Button>
                        <Button onClick={() => setCredDialogOpen(false)} variant="outline">Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-[92vh] w-full flex-col bg-background">
                <AgentChatHeader
                    messageloading={messageloading}
                    Api={Api}
                    nodes={nodes}
                    onAddNode={() => setopen(true)}
                    onAddProvider={() => navigate("/app/settings")}
                />

                <div className="flex-1 px-3 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                    <div className="mx-auto max-w-5xl py-5">
                        <AgentNodeList
                            nodes={nodes}
                            loadingfetch={loadingfetch}
                            Api={Api}
                            onUpdate={handleupdate}
                            onDelete={handledelete}
                            onAddNode={() => setopen(true)}
                            onAddProvider={() => navigate("/app/settings")}
                        />
                    </div>
                </div>

                {nodes.length > 0 && (
                    <AgentInput
                        input={input}
                        setInput={setinput}
                        nodes={nodes}
                        Node={Node}
                        messageloading={messageloading}
                        loadingrecord={loadingrecord}
                        recordstatus={recordstatus}
                        workflowloading={workflowloading}
                        type={type}
                        setType={settype}
                        selectnode={selectnode}
                        setSelectnode={setselectnode}
                        firstnode={firstnode}
                        setFirstnode={setfirstnode}
                        lastnode={lastnode}
                        setLastnode={setlastnode}
                        servicesOpen={servicesOpen}
                        setServicesOpen={setServicesOpen}
                        servicesContent={servicesContent}
                        historyContent={historyContent}
                        historyLength={history.length}
                        loadingresetmsg={loadingresetmsg}
                        onResetHistory={handleResetHistory}
                        onSendMessage={sendMessage}
                        onAbortWorkflow={abortWorkflow}
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                    />
                )}
            </div>
        </>
    );
};
