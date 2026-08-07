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
import {
  getToolDisplayLabel,
  SERVICE_TOOL_MAP,
  SERVICE_ICONS,
} from "@/shared/config/toolsselection";
import ThinkingBlock from "@/shared/components/ui/ThinkingBlock";
import AiContent from "@/shared/components/layout/LayoutAiresponse";
import { useagentstore } from "../store/store";

export type AgentFlowNodeData = {
  /** The agent node's real DB id — used to look up full data from the store (names can repeat) */
  nodeId: string;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  [key: string]: unknown;
};

const AgentFlowNode = memo(({ data }: NodeProps<Node<AgentFlowNodeData>>) => {
  // Read live agent data from the store so IPC updates flow through reactively
  const agentData = useagentstore((s) => s.nodes.find((n) => n.id === data.nodeId));
  // Fallback so the node still renders if the store hasn't synced yet
  const agent = agentData ?? {
    id: data.nodeId,
    name: "",
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
  const hasBody = Boolean(agent.thinking || agent.output || agent.activeTool);

  return (
    <div
      className={`relative w-64 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ${
        isActive
          ? "border-cyan-500 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] bg-cyan-50/5 dark:bg-cyan-950/10"
          : "border-border hover:border-cyan-500/50"
      }`}
    >
      {/* Target handle — incoming connection (left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5! h-2.5! border-2! border-cyan-500! bg-background! shadow-sm!"
      />

      {/* --- Header (n8n-style compact row: icon chip + title + actions) --- */}
      <div className="flex items-center gap-2 p-2.5">
        <div
          className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full border transition-all duration-300 ${
            isActive
              ? "bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
              : "bg-cyan-500/10 border-cyan-500/20"
          }`}
        >
          <Bot
            className={`${isActive ? "text-white animate-bounce" : "text-cyan-500 dark:text-white"}`}
            size={16}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-semibold truncate">
            <span className="truncate">{agent.name}</span>
            {isActive && (
              <span className="shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-full bg-cyan-500 text-white">
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
            {agent.provider && (
              <img
                src={BRAND_ASSETS[agent.provider.toLowerCase()] ?? BRAND_ASSETS[agent.provider]}
                alt={agent.provider}
                className="bg-white rounded p-0.5 w-3.5 h-3.5 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span className="truncate">{agent.model || agent.actor}</span>
          </div>
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
                data.onUpdate(agent.id);
              }}
              className="flex gap-2"
            >
              <PenBox size={14} /> Update
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 flex gap-2"
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(agent.id);
              }}
            >
              <Trash size={14} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tools chip */}
      {agent.tool && (
        <div className="px-2.5 pb-1.5 -mt-1 text-[11px] flex items-center gap-1">
          {SERVICE_TOOL_MAP[agent.tool] && (
            <img
              src={SERVICE_ICONS[SERVICE_TOOL_MAP[agent.tool]]}
              className="w-3 h-3 shrink-0 object-contain"
            />
          )}
          <span className="text-green-500">{getToolDisplayLabel(agent.tool)}</span>
        </div>
      )}

      {/* --- Body — runtime output (only rendered once there's something to show) --- */}
      {hasBody && (
        <div
          className="nowheel nodrag px-2.5 pb-2.5 max-h-40 overflow-y-auto text-xs border-t border-border/60 pt-2"
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
          {agent.output && (
            <div className="whitespace-pre-wrap">
              <AiContent content={agent.output} />
            </div>
          )}
        </div>
      )}

      {/* Source handle — outgoing connection (right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5! h-2.5! border-2! border-cyan-500! bg-background! shadow-sm!"
      />
    </div>
  );
});

AgentFlowNode.displayName = "AgentFlowNode";

export default AgentFlowNode;
