import { useState, useCallback } from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps, useReactFlow } from "@xyflow/react";
import { Trash } from "lucide-react";

export default function CustomEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
  } = props;
  const { setEdges } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const [edgePath] = getSmoothStepPath({
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
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      setContextMenu(null);
    },
    [id, setEdges],
  );

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      {/* Invisible wide hit area for easy clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          const svgRect = (e.target as SVGElement).closest("svg")?.getBoundingClientRect();
          if (svgRect) {
            setContextMenu({
              x: e.clientX - svgRect.left,
              y: e.clientY - svgRect.top,
            });
          }
        }}
      />

      {/* Delete popover */}
      {contextMenu && (
        <>
          {/* Backdrop to close on outside click */}
          <rect
            x={0}
            y={0}
            width="100%"
            height="100%"
            fill="transparent"
            onClick={() => setContextMenu(null)}
          />
          <foreignObject
            x={contextMenu.x - 4}
            y={contextMenu.y - 40}
            width={90}
            height={36}
            requiredExtensions="http://www.w3.org/1999/xhtml"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              onClick={onDelete}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer shadow-lg transition-colors select-none w-fit"
            >
              <Trash size={12} />
              Delete
            </div>
          </foreignObject>
        </>
      )}
    </>
  );
}
