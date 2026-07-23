import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Bot, EllipsisVertical, PenBox, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { BRAND_ASSETS } from "@/shared/config/providermodels";
import { ToolLabels } from "@/shared/config/toolsselection";
import ThinkingBlock from "@/shared/components/ui/ThinkingBlock";
import AiContent from "@/shared/components/layout/LayoutAiresponse";
import { useagentstore } from "../store/store";

export type AgentFlowNodeData = {
  /** The agent node name — used to look up full data from the store */
  nodeName: string;
  onUpdate: (name: string) => void;
  onDelete: (name: string) => void;
  [key: string]: unknown;
};

const AgentFlowNode = memo(({ data }: NodeProps<Node<AgentFlowNodeData>>) => {
  // Read live agent data from the store so IPC updates flow through reactively
  const agentData = useagentstore((s) => s.nodes.find((n) => n.name === data.nodeName));
  // Fallback so the node still renders if the store hasn't synced yet
  const agent = agentData ?? {
    name: data.nodeName,
    provider: "",
    actor: "",
    model: "",
    tool: "",
    output: "",
    thinking: "",
    activeTool: null,
    status: "idle" as const,
  };

  const isActive = agent.status === "running";

  return (
    <div
      className={`relative w-72 rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ${
        isActive
          ? "border-cyan-500 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] bg-cyan-50/5 dark:bg-cyan-950/10"
          : "border-border hover:border-cyan-500/50"
      }`}
    >
      {/* Top pulsing glow line when active */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-pulse rounded-t-xl" />
      )}

      {/* Target handle — incoming connection (top center) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3! h-3! border-2! border-cyan-500! bg-background! shadow-sm!"
      />

      {/* --- Header --- */}
      <div className="p-3 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-sm font-semibold min-w-0">
            <Bot
              className={`shrink-0 text-cyan-500 dark:text-white ${
                isActive ? "animate-bounce" : ""
              }`}
              size={18}
            />
            <span className="truncate">{agent.name}</span>
            <span
              className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border transition-all duration-300 ${
                isActive
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
              }`}
            >
              {isActive ? "ACTIVE" : agent.actor}
            </span>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="dark:hover:bg-zinc-700 hover:bg-black/10 p-1 rounded-full shrink-0"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <EllipsisVertical size={15} className="text-muted-foreground dark:text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  data.onUpdate(agent.name);
                }}
                className="flex gap-2"
              >
                <PenBox size={14} /> Update
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 flex gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete(agent.name);
                }}
              >
                <Trash size={14} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Provider + Model */}
        <div className="flex items-center gap-1.5 mt-2 text-xs">
          {agent.provider && (
            <img
              src={BRAND_ASSETS[agent.provider.toLowerCase()] ?? BRAND_ASSETS[agent.provider]}
              alt={agent.provider}
              className="bg-white rounded-lg p-0.5 w-4 h-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="font-bold truncate">{agent.model}</span>
        </div>

        {/* Tools */}
        {agent.tool && (
          <div className="text-xs mt-1">
            Tools: <span className="text-green-500">{ToolLabels[agent.tool] || agent.tool}</span>
          </div>
        )}
      </div>

      {/* --- Body — runtime output --- */}
      <div
        className="px-3 pb-3 max-h-40 overflow-y-auto text-xs"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Active tool indicator */}
        {agent.activeTool && (
          <div className="flex items-center gap-1.5 text-amber-500 font-medium animate-pulse mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate">Tool: {agent.activeTool}</span>
          </div>
        )}

        {/* Thinking block */}
        {agent.thinking && (
          <div className="mb-1">
            {agent.status === "running" ? (
              <ThinkingBlock thinking={agent.thinking} isStreaming />
            ) : (
              <ThinkingBlock thinking={agent.thinking} />
            )}
          </div>
        )}

        {/* Streaming / final output */}
        {agent.output ? (
          <div className="whitespace-pre-wrap">
            <AiContent content={agent.output} />
          </div>
        ) : agent.thinking ? null : agent.activeTool ? null : (
          <span
            className="italic opacity-50"
            style={{
              backgroundImage: "linear-gradient(90deg, #6b7280 0%, #f3f4f6 50%, #6b7280 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Awaiting sequence...
          </span>
        )}
      </div>

      {/* Source handle — outgoing connection (bottom center) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3! h-3! border-2! border-cyan-500! bg-background! shadow-sm!"
      />
    </div>
  );
});

AgentFlowNode.displayName = "AgentFlowNode";

export default AgentFlowNode;
