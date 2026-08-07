import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useagentstore } from "../store/store";
import { useAgentMessages } from "../hooks/useAgentMessages";
import { useStoreAgentMessage } from "../hooks/useStoreAgentMessage";
import { ToolApprovalDialog } from "@/shared/components/layout/ToolApprovalDialog";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { AgentChatHeader } from "./AgentChatHeader";
import { FlowCanvas } from "./FlowCanvas";
import { AgentInput } from "./AgentInput";
import { AgentNodeForm } from "./AgentNodeForm";

export const AgentChat = () => {
  const store = useagentstore();
  const queryClient = useQueryClient();
  const fetchAgentMessages = useAgentMessages();
  const { mutate: storeAgentMessage } = useStoreAgentMessage();

  useEffect(() => {
    return () => {
      window.ipcRenderer.send("cancel-workflow");
    };
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      store.setLoadingfetch(true);
      store.setLoadingerror(false);
      store.setHistory([]);
      store.setNextCursor(null);
      store.setHasMore(false);
      try {
        const response = await fetchAgentMessages();
        if (response.success && response.data) {
          store.setHistory((response.data.messages ?? []).reverse());
          store.setNextCursor(response.data.nextCursor);
          store.setHasMore(response.data.hasMore);
        }
      } catch (err: unknown) {
        store.setLoadingerror(true);
        const errMsg =
          err instanceof Error
            ? (err as any).response?.data?.message || err.message
            : "An unexpected error occurred.";
        toast.error(errMsg);
      } finally {
        store.setLoadingfetch(false);
      }
    };
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store is a zustand hook, its identity is unstable and must not retrigger this effect; intentionally mount-only
  }, []);

  useEffect(() => {
    const handleStart = (_: any, data: any) => {
      if (!data?.nodeName) return;
      const gen = store.workflowGenRef.current;
      store.setNodes((prev) => {
        if (store.workflowGenRef.current !== gen) return prev;
        return prev.map((n: any) =>
          n.name === data.nodeName ? { ...n, status: "running" as const } : n,
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

        let updatedNodes = prev.map((n: any) =>
          n.name === data.nodeName ? { ...n, status: "idle" as const, activeTool: null } : n,
        );

        const isWorkflowStillRunning = updatedNodes.some((n) => n.status === "running");

        if (!isWorkflowStillRunning) {
          // The workflow as a whole has ended — clear every node's status/
          // activeTool, not just the one that reported finishing. A
          // delegated sub-agent that hung mid tool-call may never send its
          // own node-finished, and would otherwise stay stuck showing
          // "running"/"Tool: task" forever even after the run is over.
          updatedNodes = updatedNodes.map((n: any) => ({
            ...n,
            status: "idle" as const,
            activeTool: null,
          }));
          store.setWorkflowloading(false);
          store.setMessageloading(false);
          store.setLoopIteration({ current: 0, max: 0 });
          queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["key"] });
          queryClient.invalidateQueries({ queryKey: ["creditBalance"], refetchType: "all" });
        }

        return updatedNodes;
      });

      if (finishedNode) {
        const outputText = finishedNode.output || "";
        const thinkingText = finishedNode.thinking || "";
        // finalText comes straight from the agent's resolved state (see
        // extractFinalText in workflow.ts) and is authoritative — live
        // stream-chunk attribution can miss a node's reply (e.g. an
        // Orchestrator's summary after a sub-agent's task call returns)
        // even though the model produced real output tokens.
        const finalContent: string = data.finalText || outputText || thinkingText;
        if (finalContent) {
          const msg: Record<string, any> = {
            role: "assistant",
            content: finalContent,
            name: finishedNode.name,
            provider: finishedNode.provider,
            model: finishedNode.model,
          };
          if (outputText && thinkingText) {
            msg.thinking = thinkingText;
          }
          store.updateHistory((element) => [...element, msg as any]);

          storeAgentMessage({
            role: "assistant",
            content: finalContent,
            name: finishedNode.name,
            provider: finishedNode.provider,
            model: finishedNode.model,
          });
        }
      }
    };

    const handleStream = (_: any, data: any) => {
      if (!data?.nodeName) return;
      const gen = store.workflowGenRef.current;
      store.setNodes((prev) => {
        if (store.workflowGenRef.current !== gen) return prev;
        return prev.map((n: any) =>
          n.name === data.nodeName ? { ...n, output: (n.output || "") + data.chunk } : n,
        );
      });
    };

    const handleThinking = (_: any, data: any) => {
      if (!data?.nodeName) return;
      const gen = store.workflowGenRef.current;
      store.setNodes((prev) => {
        if (store.workflowGenRef.current !== gen) return prev;
        return prev.map((n: any) =>
          n.name === data.nodeName ? { ...n, thinking: (n.thinking || "") + data.chunk } : n,
        );
      });
    };

    const handleTool = (_: any, data: any) => {
      if (!data?.nodeName) return;
      const gen = store.workflowGenRef.current;
      store.setNodes((prev) => {
        if (store.workflowGenRef.current !== gen) return prev;
        return prev.map((n: any) =>
          n.name === data.nodeName ? { ...n, activeTool: data.toolName } : n,
        );
      });
    };

    const handleToolFinished = (_: any, data: any) => {
      if (!data?.nodeName) return;
      const gen = store.workflowGenRef.current;
      store.setNodes((prev) => {
        if (store.workflowGenRef.current !== gen) return prev;
        return prev.map((n: any) => (n.name === data.nodeName ? { ...n, activeTool: null } : n));
      });
    };

    const handleError = (_: any, data: { message?: string }) => {
      const gen = store.workflowGenRef.current;
      store.setWorkflowloading(false);
      store.setMessageloading(false);
      store.setLoopIteration({ current: 0, max: 0 });
      if (data?.message) {
        toast.error("Workflow Error", { description: data.message });
      }
      store.setNodes((prev) => {
        if (store.workflowGenRef.current !== gen) return prev;
        return prev.map((n: any) => ({
          ...n,
          status: "idle" as const,
          activeTool: null,
        }));
      });
    };

    const handleToolApprovalRequest = (
      _: any,
      data: { nodeName: string; toolName: string; args: Record<string, unknown> },
    ) => {
      store.setPendingToolApproval(data);
    };

    window.ipcRenderer.on("node-stream", handleStream);
    window.ipcRenderer.on("node-thinking", handleThinking);
    window.ipcRenderer.on("node-tool-call", handleTool);
    window.ipcRenderer.on("node-tool-finished", handleToolFinished);
    window.ipcRenderer.on("node-start", handleStart);
    window.ipcRenderer.on("node-finished", handleFinished);

    const handleLoopIteration = (_: any, data: { iteration: number; max: number }) => {
      store.setLoopIteration({ current: data.iteration, max: data.max });
    };
    window.ipcRenderer.on("loop-iteration", handleLoopIteration);
    window.ipcRenderer.on("node-error", handleError);
    window.ipcRenderer.on("tool-approval-request", handleToolApprovalRequest);

    return () => {
      window.ipcRenderer.removeAllListeners("node-stream");
      window.ipcRenderer.removeAllListeners("node-thinking");
      window.ipcRenderer.removeAllListeners("node-tool-call");
      window.ipcRenderer.removeAllListeners("node-tool-finished");
      window.ipcRenderer.removeAllListeners("node-start");
      window.ipcRenderer.removeAllListeners("node-finished");
      window.ipcRenderer.removeAllListeners("node-error");
      window.ipcRenderer.removeAllListeners("tool-approval-request");
      window.ipcRenderer.removeAllListeners("loop-iteration");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store/queryClient identities are unstable and must not retrigger this IPC listener setup; intentionally mount-only
  }, []);

  const handleToolApprovalResponse = (approved: boolean) => {
    window.ipcRenderer.send("tool-approval-response", { approved });
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
        <div className="flex-1 mt-4 overflow-hidden pb-4">
          <div className="mx-auto max-w-5xl mb-4 py-5 h-full">
            <FlowCanvas />
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
  );
};
