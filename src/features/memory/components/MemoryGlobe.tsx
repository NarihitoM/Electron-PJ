import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, extend, type ReactThreeFiber } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import { Bot, Search, User, X } from "lucide-react";
import { useMemories } from "../hooks/useMemories";
import { useMemorySimilarity } from "../hooks/useMemorySimilarity";
import type { Memoryitem } from "../types/type";

extend({ OrbitControls });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required to extend r3f's JSX intrinsics
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>;
    }
  }
}

const RADIUS = 3.2;

// Fibonacci sphere: evenly distributes N points across a sphere's surface.
const fibonacciSphere = (count: number) => {
  const points: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push([
      Math.cos(theta) * radiusAtY * RADIUS,
      y * RADIUS,
      Math.sin(theta) * radiusAtY * RADIUS,
    ]);
  }
  return points;
};

const Controls = () => {
  const { camera, gl } = useThree();
  const ref = useRef<OrbitControls>(null);
  useFrame(() => ref.current?.update());
  return (
    <orbitControls
      ref={ref}
      args={[camera, gl.domElement]}
      enablePan={false}
      autoRotate
      autoRotateSpeed={0.6}
      minDistance={4}
      maxDistance={12}
    />
  );
};

const Stars = () => {
  const positions = useMemo(() => {
    const count = 800;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // spread stars in a large shell around the globe so they don't clip through it
      const r = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.05} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
};

const GlobeCore = () => (
  <mesh>
    <sphereGeometry args={[RADIUS * 0.55, 32, 32]} />
    <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.15} />
  </mesh>
);

const Edges = ({
  positionById,
  similarity,
}: {
  positionById: Map<string, [number, number, number]>;
  similarity: { id: string; relatedIds: string[] }[];
}) => {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // connect each memory to the other memories it's semantically related to (via embedding similarity)
    similarity.forEach(({ id, relatedIds }) => {
      const from = positionById.get(id);
      if (!from) return;
      relatedIds.forEach((relatedId) => {
        const to = positionById.get(relatedId);
        if (!to) return;
        points.push(new THREE.Vector3(...from), new THREE.Vector3(...to));
      });
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [positionById, similarity]);

  if (isGeometryEmpty(geometry)) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#06b6d4" transparent opacity={0.35} />
    </lineSegments>
  );
};

const isGeometryEmpty = (geometry: THREE.BufferGeometry) =>
  (geometry.getAttribute("position")?.count ?? 0) === 0;

const MemoryNode = ({
  position,
  memory,
  onSelect,
  onHover,
  highlighted,
  dimmed,
}: {
  position: [number, number, number];
  memory: Memoryitem;
  onSelect: (m: Memoryitem) => void;
  onHover: (m: Memoryitem | null) => void;
  highlighted: boolean;
  dimmed: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const color = memory.source === "auto" ? "#06b6d4" : "#a1a1aa";
  const size = hovered || highlighted ? 0.16 : 0.09;

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(memory);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(memory);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered || highlighted ? 1.2 : 0.5}
        transparent
        opacity={dimmed ? 0.2 : 1}
      />
    </mesh>
  );
};

const Scene = ({
  memories,
  similarity,
  onSelect,
  onHover,
  highlightedIds,
}: {
  memories: Memoryitem[];
  similarity: { id: string; relatedIds: string[] }[];
  onSelect: (m: Memoryitem) => void;
  onHover: (m: Memoryitem | null) => void;
  highlightedIds: Set<string>;
}) => {
  const positions = useMemo(() => fibonacciSphere(memories.length), [memories.length]);
  const positionById = useMemo(
    () => new Map(memories.map((m, i) => [m.id, positions[i]])),
    [memories, positions],
  );

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <Stars />
      <GlobeCore />
      <Edges positionById={positionById} similarity={similarity} />
      {memories.map((memory, i) => (
        <MemoryNode
          key={memory.id}
          position={positions[i]}
          memory={memory}
          onSelect={onSelect}
          onHover={onHover}
          highlighted={highlightedIds.has(memory.id)}
          dimmed={highlightedIds.size > 0 && !highlightedIds.has(memory.id)}
        />
      ))}
      <Controls />
    </>
  );
};

type Filter = "all" | "ai" | "user";

export const MemoryGlobe = () => {
  const { data: memories = [] } = useMemories();
  const { data: similarity = [] } = useMemorySimilarity(memories.length > 0);
  const [selected, setSelected] = useState<Memoryitem | null>(null);
  const [hovered, setHovered] = useState<Memoryitem | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const aiCount = memories.filter((m) => m.source === "auto").length;
  const userCount = memories.length - aiCount;

  const filteredMemories = useMemo(() => {
    if (filter === "all") return memories;
    return memories.filter((m) => (filter === "ai" ? m.source === "auto" : m.source === "manual"));
  }, [memories, filter]);

  const highlightedIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return new Set<string>();
    return new Set(memories.filter((m) => m.content.toLowerCase().includes(q)).map((m) => m.id));
  }, [memories, search]);

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="font-semibold">No memories yet</p>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Add one above to see it appear on the globe.
        </p>
      </div>
    );
  }

  const filterButton = (value: Filter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
        filter === value ? "bg-cyan-500 text-white" : "text-zinc-300 hover:bg-zinc-800"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="relative w-full h-105 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-black overflow-hidden"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onPointerLeave={() => {
        setCursor(null);
        setHovered(null);
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <Scene
          memories={filteredMemories}
          similarity={similarity}
          onSelect={setSelected}
          onHover={setHovered}
          highlightedIds={highlightedIds}
        />
      </Canvas>

      {/* Legend + counts */}
      <div className="absolute top-3 left-3 z-10 rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur px-3 py-2 flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shrink-0" />
          <span className="text-zinc-200">AI memory ({aiCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400 shrink-0" />
          <span className="text-zinc-200">User input memory ({userCount})</span>
        </div>
      </div>

      {/* Search + filter */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur px-2.5 py-1.5">
          <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="w-36 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-zinc-500 hover:text-zinc-200 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-1">
          {filterButton("all", "All")}
          {filterButton("ai", "AI")}
          {filterButton("user", "User")}
        </div>
      </div>

      {/* Empty filter result indicator */}
      {filteredMemories.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 py-2 text-sm text-zinc-300">
            No {filter === "ai" ? "AI" : "user"} memories yet
          </p>
        </div>
      )}

      {/* Hover tooltip */}
      {hovered && cursor && (
        <div
          className="absolute z-10 max-w-60 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur px-3 py-2 text-xs text-zinc-100 pointer-events-none"
          style={{
            left: Math.min(cursor.x + 12, window.innerWidth - 260),
            top: cursor.y + 12,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {hovered.source === "auto" ? (
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <User className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              {hovered.source === "auto" ? "AI memory" : "User input"}
            </span>
          </div>
          <p className="leading-relaxed line-clamp-3">{hovered.content}</p>
        </div>
      )}

      {selected && (
        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur p-3 flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${selected.source === "auto" ? "bg-cyan-500/10" : "bg-zinc-800"}`}
          >
            {selected.source === "auto" ? (
              <Bot className="w-4 h-4 text-cyan-400" />
            ) : (
              <User className="w-4 h-4 text-zinc-400" />
            )}
          </div>
          <p className="flex-1 text-sm text-zinc-100 leading-relaxed">{selected.content}</p>
          <button
            onClick={() => setSelected(null)}
            className="shrink-0 text-zinc-500 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
