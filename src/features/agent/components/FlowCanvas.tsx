import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type ReactFlowInstance,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useAgentNodes } from "@/features/agent/hooks/useAgentNodes";
import { useAgentEdges } from "@/features/agent/hooks/useAgentEdges";
import { useSaveAgentEdges } from "@/features/agent/hooks/useSaveAgentEdges";
import { useSaveNodePositions } from "@/features/agent/hooks/useSaveNodePositions";
import { useagentstore } from "../store/store";
import AgentFlowNode, { type AgentFlowNodeData } from "./AgentFlowNode";
import CustomEdge from "./CustomEdge";

/* ─── Custom type registrations (stable references) ─── */
const nodeTypes = { agentFlowNode: AgentFlowNode } as unknown as NodeTypes;
const edgeTypes = { custom: CustomEdge } as unknown as EdgeTypes;

/* ─── Default edge config (muted gray — n8n style) ─── */
const defaultEdgeOptions = {
  type: "custom",
  style: { stroke: "#9ca3af", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
  interactionWidth: 24,
};

/* ─── Helpers ─── */
/* n8n-style horizontal layout: nodes flow left-to-right, wrapping into rows */
const NODE_WIDTH = 256;
const NODE_GAP_X = 100;
const NODE_HEIGHT = 140;
const NODE_GAP_Y = 60;

function computePosition(
  index: number,
  total: number,
  existing: Record<string, { x: number; y: number }>,
  nodeId: string,
): { x: number; y: number } {
  if (existing[nodeId]) return existing[nodeId];
  if (total <= 6) {
    return { x: index * (NODE_WIDTH + NODE_GAP_X) + 60, y: 120 };
  }
  const cols = 6;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return {
    x: 60 + col * (NODE_WIDTH + NODE_GAP_X),
    y: 60 + row * (NODE_HEIGHT + NODE_GAP_Y),
  };
}

export const FlowCanvas = () => {
  const store = useagentstore();
  /* Stable action references — prevents infinite loop from `store` being a new ref every render */
  const setFlowEdges = useagentstore((s) => s.setFlowEdges);
  const setNodePositions = useagentstore((s) => s.setNodePositions);
  const { data: Api = [] } = useServiceKeys();
  const {
    data: fetchedNodes = [],
    isLoading,
    isError: nodesError,
    refetch: refetchNodes,
  } = useAgentNodes();
  const { data: fetchedEdges = [], isError: edgesError, refetch: refetchEdges } = useAgentEdges();
  const { mutate: saveEdgesToBackend } = useSaveAgentEdges();
  const { mutate: savePositionsToBackend } = useSaveNodePositions();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevEdgeCountRef = useRef<number>(0);

  /* ── Surface silent fetch failures instead of leaving the canvas stuck stale ── */
  useEffect(() => {
    if (nodesError) {
      toast.error("Failed to load agent nodes", {
        action: { label: "Retry", onClick: () => refetchNodes() },
      });
    }
  }, [nodesError, refetchNodes]);
  useEffect(() => {
    if (edgesError) {
      toast.error("Failed to load agent edges", {
        action: { label: "Retry", onClick: () => refetchEdges() },
      });
    }
  }, [edgesError, refetchEdges]);

  /* ── Sync DB nodes into store on every fetch, and populate positions ── */
  const nodesRef = useRef<string>("");
  useEffect(() => {
    if (fetchedNodes.length === 0) return;
    const serialized = JSON.stringify(fetchedNodes.map((n: any) => n.id));
    if (serialized === nodesRef.current) return;
    nodesRef.current = serialized;

    store.setNodes(fetchedNodes as any);
    // Restore saved positions from the backend (keyed by real node id — names aren't unique)
    const savedPositions: Record<string, { x: number; y: number }> = {};
    for (const node of fetchedNodes as any[]) {
      if (node.posX !== null && node.posY !== null) {
        savedPositions[node.id] = { x: node.posX, y: node.posY };
      }
    }
    if (Object.keys(savedPositions).length > 0) {
      setNodePositions(savedPositions);
    }
  }, [fetchedNodes, store, setNodePositions]);

  /* ── Stable callbacks for node actions ── */
  const onUpdate = useCallback(
    (id: string) => {
      const node = store.nodes.find((n) => n.id === id);
      if (!node) return;
      store.setNodeid(node.id);
      store.setName(node.name);
      store.setActor(node.actor);
      store.setPrompt((node as any).systemprompt || "");
      store.setProvider(node.provider);
      store.setModel(node.model);
      store.setTool(node.tool);
      store.setNodeDialogMode("update");
      store.setNodeDialogOpen(true);
    },
    [store],
  );

  const onDelete = useCallback(
    (id: string) => {
      const node = store.nodes.find((n) => n.id === id);
      if (!node) return;
      store.setNodeid(node.id);
      store.setName(node.name);
      store.setNodeDialogMode("delete");
      store.setNodeDialogOpen(true);
    },
    [store],
  );

  /* ── Build React Flow nodes from store.nodes (identity is the real DB id — names can repeat) ── */
  const flowNodes: Node<AgentFlowNodeData>[] = store.nodes.map((agent, idx) => ({
    id: agent.id,
    type: "agentFlowNode",
    position: computePosition(idx, store.nodes.length, store.nodePositions, agent.id),
    data: { nodeId: agent.id, onUpdate, onDelete },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes as unknown as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    store.flowEdges.map((e) => ({
      ...e,
      type: "custom",
      style: { stroke: "#9ca3af", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
      interactionWidth: 24,
    })),
  );

  /* ── Sync when agents are added/removed from store (avoids re-creating every IPC tick) ── */
  const knownIdsRef = useRef<string>("");
  const currentIds = store.nodes.map((n) => n.id).join(",");
  const pendingEdgeInsert = useagentstore((s) => s.pendingEdgeInsert);
  const setPendingEdgeInsert = useagentstore((s) => s.setPendingEdgeInsert);

  useEffect(() => {
    if (currentIds === knownIdsRef.current) return; // no structural change
    const previousIds = new Set(knownIdsRef.current ? knownIdsRef.current.split(",") : []);
    knownIdsRef.current = currentIds;

    const newlyAdded = store.nodes.map((n) => n.id).filter((id) => !previousIds.has(id));

    setNodes(
      store.nodes.map((agent, idx) => ({
        id: agent.id,
        type: "agentFlowNode",
        position: computePosition(idx, store.nodes.length, store.nodePositions, agent.id),
        data: { nodeId: agent.id, onUpdate, onDelete },
      })),
    );

    // Clean up edges connected to deleted nodes
    const nodeIds = new Set(store.nodes.map((n) => n.id));
    setEdges((prev) => {
      let next = prev.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

      // If a node was just created via the edge "+" button, splice it into that edge
      if (pendingEdgeInsert && newlyAdded.length === 1) {
        const [newNodeId] = newlyAdded;
        const { edgeId, source, target } = pendingEdgeInsert;
        const hadOriginal = next.some((e) => e.id === edgeId);
        next = next.filter((e) => e.id !== edgeId);
        next = [
          ...next,
          {
            id: `e-${source}-${newNodeId}`,
            source,
            target: newNodeId,
            type: "custom",
            style: { stroke: "#9ca3af", strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
          },
          {
            id: `e-${newNodeId}-${target}`,
            source: newNodeId,
            target,
            type: "custom",
            style: { stroke: "#9ca3af", strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
          },
        ];
        if (hadOriginal) {
          const sourcePos = store.nodePositions[source];
          const targetPos = store.nodePositions[target];
          if (sourcePos && targetPos) {
            setNodePositions({
              ...store.nodePositions,
              [newNodeId]: {
                x: (sourcePos.x + targetPos.x) / 2,
                y: (sourcePos.y + targetPos.y) / 2,
              },
            });
          }
        }
        setPendingEdgeInsert(null);
      }

      if (next.length !== prev.length || next !== prev) {
        setFlowEdges(next.map((e) => ({ id: e.id, source: e.source, target: e.target })));
      }
      return next;
    });
  }, [
    currentIds,
    store.nodes,
    store.nodePositions,
    setNodes,
    setEdges,
    setNodePositions,
    setFlowEdges,
    onUpdate,
    onDelete,
    pendingEdgeInsert,
    setPendingEdgeInsert,
  ]);

  /* ── Edge handlers ── */
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => connection.source !== connection.target,
    [],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;
      setEdges((eds: Edge[]) => {
        const newEdge: Edge = {
          id: `e-${connection.source}-${connection.target}`,
          source: connection.source!,
          target: connection.target!,
          type: "custom",
          style: { stroke: "#9ca3af", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
        };
        const updated: Edge[] = addEdge(newEdge, eds);
        setFlowEdges(updated.map((e) => ({ id: e.id, source: e.source, target: e.target })));
        return updated;
      });
    },
    [setEdges, setFlowEdges],
  );

  /* ── Persist edges to store when they change (deletions, etc.) ── */
  /* Uses stable `setFlowEdges` selector — no `store` dep, so no infinite loop */
  useEffect(() => {
    setFlowEdges(edges.map((e) => ({ id: e.id, source: e.source, target: e.target })));
  }, [edges, setFlowEdges]);

  /* ── Sync backend edges into React Flow state ── */
  const edgesFetchedRef = useRef<string>("");
  useEffect(() => {
    if (fetchedEdges.length === 0) return;
    const serialized = JSON.stringify(fetchedEdges.map((e: any) => `${e.source}-${e.target}`));
    if (serialized === edgesFetchedRef.current) return;
    edgesFetchedRef.current = serialized;

    setEdges(
      fetchedEdges.map((e) => ({
        id: e.id || `e-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: "custom",
        style: { stroke: "#9ca3af", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af" },
      })),
    );
  }, [fetchedEdges, setEdges]);

  /* ── Debounced save edges to backend ── */
  /* Listens to store.flowEdges (which mirrors edges via the effect above) */
  const latestFlowEdges = useagentstore((s) => s.flowEdges);
  useEffect(() => {
    const edgeData = latestFlowEdges.map((e) => ({ source: e.source, target: e.target }));
    const prevCount = prevEdgeCountRef.current;
    const currCount = latestFlowEdges.length;
    prevEdgeCountRef.current = currCount;

    /* Edge was deleted — save immediately so DB stays in sync */
    if (currCount < prevCount) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      saveEdgesToBackend(edgeData);
      return;
    }

    /* Edge added or reordered — debounce at 500 ms */
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      saveEdgesToBackend(edgeData);
      debounceRef.current = null;
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [latestFlowEdges, saveEdgesToBackend]);

  /* ── Drag handler — persist positions to store AND backend ── */
  /* Reads latest positions from store.getState() to avoid stale closure */
  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      const current = useagentstore.getState().nodePositions;
      const updated = {
        ...current,
        [node.id]: { x: node.position.x, y: node.position.y },
      };
      setNodePositions(updated);

      // Debounce-save to backend
      if (posDebounceRef.current) {
        clearTimeout(posDebounceRef.current);
      }
      posDebounceRef.current = setTimeout(() => {
        const entries = Object.entries(updated);
        // nodePositions is keyed by the real DB node id already
        const nodes = useagentstore.getState().nodes;
        const positions = entries
          .map(([id, pos]) => {
            const match = nodes.find((n: any) => n.id === id);
            if (!match) return null;
            return { nodeid: match.id, posX: pos.x, posY: pos.y };
          })
          .filter(Boolean) as { nodeid: string; posX: number; posY: number }[];
        if (positions.length > 0) {
          savePositionsToBackend(positions);
        }
        posDebounceRef.current = null;
      }, 500);
    },
    [setNodePositions, savePositionsToBackend],
  );

  /* ── Cleanup position debounce on unmount ── */
  useEffect(() => {
    return () => {
      if (posDebounceRef.current) {
        clearTimeout(posDebounceRef.current);
        posDebounceRef.current = null;
      }
    };
  }, []);

  /* ── Keep nodes in view when the window is resized/minimized — React Flow only
     fits the view once on mount, so shrinking the window can push nodes out of
     the visible pane until the user manually pans/zooms ── */
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        reactFlowInstanceRef.current?.fitView({ padding: 0.3 });
      }, 200);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  /* ── Handlers for CTA buttons ── */
  const onAddNode = useCallback(() => {
    store.setNodeDialogMode("create");
    store.resetForm();
    store.setNodeDialogOpen(true);
  }, [store]);

  const onAddProvider = useCallback(() => {
    store.setServicesOpen(true);
  }, [store]);

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground text-sm">
        Loading agents...
      </div>
    );
  }

  /* ── Empty state ── */
  if (store.nodes.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-center">
        <h1 className="text-3xl font-semibold mb-2">Build your Agent Chain</h1>
        <p className="text-muted-foreground mb-6">
          Connect multiple models to solve complex tasks.
        </p>
        {Api.length > 0 ? (
          <Button
            onClick={onAddNode}
            className="bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-white dark:text-black"
          >
            Add First Node
          </Button>
        ) : (
          <Button className="bg-cyan-500 dark:bg-white" onClick={onAddProvider}>
            Add Provider
          </Button>
        )}
      </div>
    );
  }

  /* ── Canvas ── */
  return (
    <div className="w-full h-full min-h-100 rounded-xl border bg-card/50">
      {/* Edge selection styles + dark-mode controls + hide branding */}
      <style>{`
        .react-flow__edge-path {
          cursor: pointer;
        }

        /* Controls (+ / - buttons) — dark-mode friendly */
        .react-flow__controls {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .react-flow__controls button {
          background: var(--card) !important;
          border: 1px solid var(--border) !important;
          color: var(--foreground) !important;
          fill: var(--foreground) !important;
          width: 32px !important;
          height: 32px !important;
        }
        .react-flow__controls button:hover {
          background: var(--muted) !important;
        }
        .react-flow__controls button svg {
          fill: var(--foreground) !important;
          color: var(--foreground) !important;
        }

        /* Hide ReactFlow branding / attribution link */
        .react-flow__attribution {
          display: none !important;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeDragStop={onNodeDragStop}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        deleteKeyCode={["Backspace", "Delete"]}
        selectionKeyCode={null}
        multiSelectionKeyCode="Shift"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#4b5563" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeColor="#06b6d4"
          nodeColor={(n) => {
            const agent = store.nodes.find((a) => a.id === n.id);
            if (agent?.status === "running") return "#06b6d4";
            if (agent?.status === "error") return "#ef4444";
            if (agent?.status === "completed") return "#22c55e";
            return "#6b7280";
          }}
          maskColor="rgba(0,0,0,0.15)"
          className="bg-background! border-border! shadow-md!"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;
