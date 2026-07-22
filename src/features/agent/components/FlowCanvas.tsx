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
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "@/shared/components/ui/button";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useAgentNodes } from "@/features/agent/hooks/useAgentNodes";
import { useAgentEdges } from "@/features/agent/hooks/useAgentEdges";
import { useSaveAgentEdges } from "@/features/agent/hooks/useSaveAgentEdges";
import { useSaveNodePositions } from "@/features/agent/hooks/useSaveNodePositions";
import { useagentstore } from "../store/store";
import AgentFlowNode, { type AgentFlowNodeData } from "./AgentFlowNode";

/* ─── Custom node type registration (stable reference) ─── */
const nodeTypes = { agentFlowNode: AgentFlowNode } as unknown as NodeTypes;

/* ─── Default edge config ─── */
const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "#06b6d4", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" },
  interactionWidth: 20,
};

/* ─── Helpers ─── */
const NODE_WIDTH = 288;
const NODE_GAP_X = 80;
const NODE_GAP_Y = 100;

function computePosition(
  index: number,
  total: number,
  existing: Record<string, { x: number; y: number }>,
  nodeName: string,
): { x: number; y: number } {
  if (existing[nodeName]) return existing[nodeName];
  if (total <= 6) {
    return { x: 250, y: index * 220 + 40 };
  }
  const cols = 3;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return {
    x: 80 + col * (NODE_WIDTH + NODE_GAP_X),
    y: 40 + row * (220 + NODE_GAP_Y),
  };
}

export const FlowCanvas = () => {
  const store = useagentstore();
  /* Stable action references — prevents infinite loop from `store` being a new ref every render */
  const setFlowEdges = useagentstore((s) => s.setFlowEdges);
  const setNodePositions = useagentstore((s) => s.setNodePositions);
  const { data: Api = [] } = useServiceKeys();
  const { data: fetchedNodes = [], isLoading } = useAgentNodes();
  const { data: fetchedEdges = [] } = useAgentEdges();
  const { mutate: saveEdgesToBackend } = useSaveAgentEdges();
  const { mutate: savePositionsToBackend } = useSaveNodePositions();
  const initializedRef = useRef(false);
  const edgesInitRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Sync DB nodes into store once, and populate positions ── */
  useEffect(() => {
    if (fetchedNodes.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      store.setNodes(fetchedNodes as any);
      // Restore saved positions from the backend
      const savedPositions: Record<string, { x: number; y: number }> = {};
      for (const node of fetchedNodes as any[]) {
        if (node.posX !== null && node.posY !== null) {
          savedPositions[node.name || node.id] = { x: node.posX, y: node.posY };
        }
      }
      if (Object.keys(savedPositions).length > 0) {
        setNodePositions(savedPositions);
      }
    }
  }, [fetchedNodes, store, setNodePositions]);

  /* ── Stable callbacks for node actions ── */
  const onUpdate = useCallback(
    (name: string) => {
      const node = store.nodes.find((n) => n.name === name);
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
    (name: string) => {
      const node = store.nodes.find((n) => n.name === name);
      if (!node) return;
      store.setNodeid(node.id);
      store.setName(node.name);
      store.setNodeDialogMode("delete");
      store.setNodeDialogOpen(true);
    },
    [store],
  );

  /* ── Build React Flow nodes from store.nodes (stable: only nodeName + callbacks) ── */
  const flowNodes: Node<AgentFlowNodeData>[] = store.nodes.map((agent, idx) => ({
    id: agent.name,
    type: "agentFlowNode",
    position: computePosition(idx, store.nodes.length, store.nodePositions, agent.name),
    data: { nodeName: agent.name, onUpdate, onDelete },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes as unknown as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    store.flowEdges.map((e) => ({
      ...e,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#06b6d4", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" },
      interactionWidth: 20,
    })),
  );

  /* ── Sync when agents are added/removed from store (avoids re-creating every IPC tick) ── */
  // We keep a set of known node ids and only update when the list changes structurally
  const knownIdsRef = useRef<string>("");
  const currentIds = store.nodes.map((n) => n.name).join(",");

  useEffect(() => {
    if (currentIds === knownIdsRef.current) return; // no structural change
    knownIdsRef.current = currentIds;

    setNodes(
      store.nodes.map((agent, idx) => ({
        id: agent.name,
        type: "agentFlowNode",
        position: computePosition(idx, store.nodes.length, store.nodePositions, agent.name),
        data: { nodeName: agent.name, onUpdate, onDelete },
      })),
    );
  }, [currentIds, store.nodePositions, setNodes, onUpdate, onDelete]);

  /* ── Edge handlers ── */
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds: Edge[]) => {
        const newEdge: Edge = {
          id: `e-${connection.source}-${connection.target}`,
          source: connection.source!,
          target: connection.target!,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#06b6d4", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" },
          interactionWidth: 20,
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

  /* ── Sync backend edges into React Flow state on initial load ── */
  useEffect(() => {
    if (fetchedEdges.length > 0 && !edgesInitRef.current) {
      edgesInitRef.current = true;
      setEdges(
        fetchedEdges.map((e) => ({
          id: e.id || `e-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#06b6d4", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" },
          interactionWidth: 20,
        })),
      );
    }
  }, [fetchedEdges, setEdges]);

  /* ── Debounced save edges to backend ── */
  /* Listens to store.flowEdges (which mirrors edges via the effect above) */
  const latestFlowEdges = useagentstore((s) => s.flowEdges);
  useEffect(() => {
    /* Skip the initial empty state and the first load (handled by sync above) */
    if (!edgesInitRef.current) return;
    if (latestFlowEdges.length === 0 && !debounceRef.current) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      saveEdgesToBackend(latestFlowEdges.map((e) => ({ source: e.source, target: e.target })));
      debounceRef.current = null;
    }, 1500);

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
        // Map node names to their DB ids via store.nodes
        const nodes = useagentstore.getState().nodes;
        const positions = entries
          .map(([name, pos]) => {
            const match = nodes.find((n: any) => n.name === name);
            if (!match) return null;
            return { nodeid: match.id, posX: pos.x, posY: pos.y };
          })
          .filter(Boolean) as { nodeid: string; posX: number; posY: number }[];
        if (positions.length > 0) {
          savePositionsToBackend(positions);
        }
        posDebounceRef.current = null;
      }, 1500);
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
    <div className="w-full h-[60vh] min-h-100 rounded-xl border bg-card/50">
      {/* Edge selection styles */}
      <style>{`
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #22d3ee !important;
          stroke-width: 3.5 !important;
        }
        .react-flow__edge:hover .react-flow__edge-path {
          stroke: #22d3ee !important;
          stroke-width: 3 !important;
        }
        .react-flow__edge-path {
          cursor: pointer;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
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
        <Controls showInteractive={false} className="bg-background! border-border!" />
        <MiniMap
          nodeStrokeColor="#06b6d4"
          nodeColor={(n) => {
            const agent = store.nodes.find((a) => a.name === n.id);
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
