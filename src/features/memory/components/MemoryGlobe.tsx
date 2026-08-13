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

// Force-directed layout tuning, similar in spirit to Obsidian's graph view:
// nodes repel each other, edges pull related nodes together, and a weak
// center pull keeps the whole cluster from drifting off screen.
const SPAWN_RADIUS = 3;
const REPEL_STRENGTH = 0.8;
const SPRING_LENGTH = 1.8;
const SPRING_STRENGTH = 0.05;
const CENTER_STRENGTH = 0.015;
const DAMPING = 0.82;
const SETTLE_TICKS = 220;

const useForceLayout = (count: number, edgePairs: [number, number][]) => {
  const positionsRef = useRef<THREE.Vector3[]>([]);
  const velocitiesRef = useRef<THREE.Vector3[]>([]);
  const tickRef = useRef(0);

  useMemo(() => {
    positionsRef.current = Array.from({ length: count }, () => {
      const r = SPAWN_RADIUS * (0.3 + Math.random() * 0.7);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );
    });
    velocitiesRef.current = Array.from({ length: count }, () => new THREE.Vector3());
    tickRef.current = 0;
  }, [count]);

  const step = () => {
    if (tickRef.current > SETTLE_TICKS) return;
    tickRef.current += 1;

    const pos = positionsRef.current;
    const vel = velocitiesRef.current;
    const n = pos.length;
    if (n === 0) return;

    const forces = pos.map(() => new THREE.Vector3());

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const delta = pos[i].clone().sub(pos[j]);
        const distSq = Math.max(delta.lengthSq(), 0.01);
        delta.normalize().multiplyScalar(REPEL_STRENGTH / distSq);
        forces[i].add(delta);
        forces[j].sub(delta);
      }
    }

    edgePairs.forEach(([a, b]) => {
      const delta = pos[b].clone().sub(pos[a]);
      const dist = Math.max(delta.length(), 0.01);
      const stretch = dist - SPRING_LENGTH;
      delta.normalize().multiplyScalar(stretch * SPRING_STRENGTH);
      forces[a].add(delta);
      forces[b].sub(delta);
    });

    for (let i = 0; i < n; i++) {
      forces[i].add(pos[i].clone().multiplyScalar(-CENTER_STRENGTH));
    }

    for (let i = 0; i < n; i++) {
      vel[i].add(forces[i]).multiplyScalar(DAMPING);
      pos[i].add(vel[i]);
    }
  };

  return { positionsRef, step };
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
      minDistance={2}
      maxDistance={22}
    />
  );
};

const Stars = () => {
  const positions = useMemo(() => {
    const count = 800;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // spread stars in a large shell around the graph so they don't clip through it
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

const Edges = ({
  positionsRef,
  edgePairs,
}: {
  positionsRef: React.MutableRefObject<THREE.Vector3[]>;
  edgePairs: [number, number][];
}) => {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const positionsArray = useMemo(
    () => new Float32Array(edgePairs.length * 2 * 3),
    [edgePairs.length],
  );

  useFrame(() => {
    const geom = geometryRef.current;
    if (!geom) return;
    const pos = positionsRef.current;
    edgePairs.forEach(([a, b], i) => {
      const pa = pos[a];
      const pb = pos[b];
      if (!pa || !pb) return;
      const o = i * 6;
      positionsArray[o] = pa.x;
      positionsArray[o + 1] = pa.y;
      positionsArray[o + 2] = pa.z;
      positionsArray[o + 3] = pb.x;
      positionsArray[o + 4] = pb.y;
      positionsArray[o + 5] = pb.z;
    });
    const attr = geom.getAttribute("position") as THREE.BufferAttribute;
    attr.needsUpdate = true;
  });

  if (edgePairs.length === 0) return null;

  return (
    <lineSegments>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positionsArray, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#06b6d4" transparent opacity={0.35} />
    </lineSegments>
  );
};

const MemoryNode = ({
  index,
  positionsRef,
  memory,
  onSelect,
  onHover,
  highlighted,
  dimmed,
}: {
  index: number;
  positionsRef: React.MutableRefObject<THREE.Vector3[]>;
  memory: Memoryitem;
  onSelect: (m: Memoryitem) => void;
  onHover: (m: Memoryitem | null) => void;
  highlighted: boolean;
  dimmed: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const color = memory.source === "auto" ? "#06b6d4" : "#a1a1aa";
  const size = hovered || highlighted ? 0.16 : 0.09;

  useFrame(() => {
    const p = positionsRef.current[index];
    if (p && meshRef.current) meshRef.current.position.copy(p);
  });

  return (
    <mesh
      ref={meshRef}
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
  const idToIndex = useMemo(() => new Map(memories.map((m, i) => [m.id, i])), [memories]);

  const edgePairs = useMemo(() => {
    const pairs: [number, number][] = [];
    // connect each memory to the other memories it's semantically related to (via embedding similarity)
    similarity.forEach(({ id, relatedIds }) => {
      const a = idToIndex.get(id);
      if (a === undefined) return;
      relatedIds.forEach((relatedId) => {
        const b = idToIndex.get(relatedId);
        if (b === undefined || b === a) return;
        pairs.push([a, b]);
      });
    });
    return pairs;
  }, [similarity, idToIndex]);

  const { positionsRef, step } = useForceLayout(memories.length, edgePairs);
  useFrame(() => step());

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <Stars />
      <Edges positionsRef={positionsRef} edgePairs={edgePairs} />
      {memories.map((memory, i) => (
        <MemoryNode
          key={memory.id}
          index={i}
          positionsRef={positionsRef}
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
      <Canvas camera={{ position: [0, 0, 13], fov: 50 }}>
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
