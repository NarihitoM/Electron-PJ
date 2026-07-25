import { useState, useCallback } from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps, useReactFlow } from "@xyflow/react";
import { Plus, Trash } from "lucide-react";
import { useagentstore } from "../store/store";

export default function CustomEdge(props: EdgeProps) {
  const {
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    selected,
  } = props;
  const { deleteElements } = useReactFlow();
  const setPendingEdgeInsert = useagentstore((s) => s.setPendingEdgeInsert);
  const setNodeDialogMode = useagentstore((s) => s.setNodeDialogMode);
  const resetForm = useagentstore((s) => s.resetForm);
  const setNodeDialogOpen = useagentstore((s) => s.setNodeDialogOpen);
  const [hovered, setHovered] = useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  const onDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // deleteElements routes through onEdgesChange, which is what actually
      // syncs the removal back into FlowCanvas's controlled edges state —
      // setEdges() from useReactFlow mutates the internal store directly and
      // gets silently overwritten on the next render since edges is controlled.
      deleteElements({ edges: [{ id }] });
    },
    [id, deleteElements],
  );

  const onInsert = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setPendingEdgeInsert({ edgeId: id, source, target });
      resetForm();
      setNodeDialogMode("create");
      setNodeDialogOpen(true);
    },
    [id, source, target, setPendingEdgeInsert, resetForm, setNodeDialogMode, setNodeDialogOpen],
  );

  const active = hovered || selected;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: active ? "#06b6d4" : "var(--edge-muted, #9ca3af)",
          strokeWidth: active ? 2.5 : 1.5,
        }}
      />

      {/* Invisible wide hit area for hover + click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {active && (
        <foreignObject
          x={labelX - 28}
          y={labelY - 12}
          width={56}
          height={24}
          requiredExtensions="http://www.w3.org/1999/xhtml"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex items-center gap-1 w-fit mx-auto">
            <button
              type="button"
              onClick={onInsert}
              title="Insert node"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-md transition-colors"
            >
              <Plus size={13} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Delete edge"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors"
            >
              <Trash size={11} />
            </button>
          </div>
        </foreignObject>
      )}
    </>
  );
}
