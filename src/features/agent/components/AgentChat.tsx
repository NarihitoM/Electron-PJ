import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useagentstore } from "../store/store"
import { agentauth } from "../api/api"
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog"
import { ImageLightbox } from "@/shared/components/ImageLightbox"
import { Toaster } from "@/shared/components/ui/sonner"
import { toast } from "sonner"
import { AgentChatHeader } from "./AgentChatHeader"
import { AgentNodeList } from "./AgentNodeList"
import { AgentInput } from "./AgentInput"
import { AgentNodeForm } from "./AgentNodeForm"

export const AgentChat = () => {
    const store = useagentstore()
    const queryClient = useQueryClient()

    useEffect(() => {
        return () => {
            window.ipcRenderer.send('cancel-workflow');
        };
    }, [])

    useEffect(() => {
        const fetchMessages = async () => {
            store.setLoadingfetch(true)
            store.setLoadingerror(false)
            store.setHistory([])
            store.setNextCursor(null)
            store.setHasMore(false)
            try {
                const response = await agentauth.fetchagentmessages()
                if (response.success && response.data) {
                    store.setHistory((response.data.messages ?? []).reverse())
                    store.setNextCursor(response.data.nextCursor)
                    store.setHasMore(response.data.hasMore)
                }
            } catch (err: unknown) {
                store.setLoadingerror(true)
                const errMsg = err instanceof Error ? (err as any).response?.data?.message || err.message : "An unexpected error occurred."
                toast.error(errMsg)
            } finally {
                store.setLoadingfetch(false)
            }
        }
        fetchMessages()
    }, [])

    useEffect(() => {
        const handleStart = (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = store.workflowGenRef.current;
            store.setNodes((prev) => {
                if (store.workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, status: 'running' as const } : n
                );
            });
        };

        const handleFinished = async (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = store.workflowGenRef.current;

            const currentNodes = useagentstore.getState().nodes;
            const targetNode = currentNodes.find((n: any) => n.name === data.nodeName);
            const finishedNode = targetNode
                ? {
                    name: targetNode.name,
                    output: targetNode.output || "",
                    thinking: targetNode.thinking || "",
                    provider: targetNode.provider,
                    model: targetNode.model,
                }
                : null;

            store.setNodes((prev) => {
                if (store.workflowGenRef.current !== gen) return prev;

                const updatedNodes = prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, status: "idle" as const } : n
                );

                const isWorkflowStillRunning = updatedNodes.some(n => n.status === 'running');

                if (!isWorkflowStillRunning) {
                    store.setWorkflowloading(false);
                    store.setMessageloading(false);
                    queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
                    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                    queryClient.invalidateQueries({ queryKey: ["key"] });
                    queryClient.invalidateQueries({ queryKey: ["creditBalance"], refetchType: 'all' });
                }

                return updatedNodes;
            });

            if (finishedNode) {
                const finalContent = finishedNode.output || finishedNode.thinking || "";
                if (finalContent) {
                    store.updateHistory((element) => [...element, {
                        role: "assistant",
                        content: finalContent,
                        name: finishedNode.name,
                        provider: finishedNode.provider,
                        model: finishedNode.model
                    }]);

                    agentauth.storeagentmessage(
                        "assistant", finalContent, finishedNode.name,
                        finishedNode.provider, finishedNode.model
                    );
                }
            }
        };

        const handleStream = (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = store.workflowGenRef.current;
            store.setNodes((prev) => {
                if (store.workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, output: (n.output || "") + data.chunk } : n
                );
            });
        };

        const handleThinking = (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = store.workflowGenRef.current;
            store.setNodes((prev) => {
                if (store.workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, thinking: (n.thinking || "") + data.chunk } : n
                );
            });
        };

        const handleTool = (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = store.workflowGenRef.current;
            store.setNodes((prev) => {
                if (store.workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, activeTool: data.toolName } : n
                );
            });
        };

        const handleToolFinished = (_: any, data: any) => {
            if (!data?.nodeName) return;
            const gen = store.workflowGenRef.current;
            store.setNodes(prev => {
                if (store.workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) =>
                    n.name === data.nodeName ? { ...n, activeTool: null } : n
                );
            });
        };

        const handleError = (_: any, data: { message?: string }) => {
            const gen = store.workflowGenRef.current;
            store.setWorkflowloading(false);
            store.setMessageloading(false);
            if (data?.message) {
                toast.error("Workflow Error", { description: data.message });
            }
            store.setNodes((prev) => {
                if (store.workflowGenRef.current !== gen) return prev;
                return prev.map((n: any) => ({
                    ...n,
                    status: 'idle' as const,
                    activeTool: null
                }));
            });
        };

        const handleToolApprovalRequest = (_: any, data: { nodeName: string; toolName: string; args: Record<string, unknown> }) => {
            store.setPendingToolApproval(data);
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
    }, [])

    const handleToolApprovalResponse = (approved: boolean) => {
        window.ipcRenderer.send('tool-approval-response', { approved });
        store.setPendingToolApproval(null);
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <ToolApprovalDialog
                open={store.pendingToolApproval !== null}
                toolName={store.pendingToolApproval?.toolName || ""}
                toolQuery={store.pendingToolApproval?.args || null}
                onApprove={() => handleToolApprovalResponse(true)}
                onReject={() => handleToolApprovalResponse(false)}
            />
            <AgentNodeForm />
            <div className="flex h-[92vh] w-full flex-col bg-background">
                <AgentChatHeader />
                <div className="flex-1 px-3 overflow-y-auto mt-4" style={{ scrollbarWidth: "none" }}>
                    <div className="mx-auto max-w-5xl py-5">
                        <AgentNodeList />
                    </div>
                </div>
                {store.nodes.length > 0 && <AgentInput />}
            </div>
            <ImageLightbox
                images={store.lightboxImages}
                initialIndex={store.lightboxIndex}
                open={store.lightboxOpen}
                onOpenChange={store.setLightboxOpen}
            />
        </>
    )
}
