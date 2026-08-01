import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, extend, type ReactThreeFiber } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import { Bot, User, X } from "lucide-react";
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
}: {
  position: [number, number, number];
  memory: Memoryitem;
  onSelect: (m: Memoryitem) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const color = memory.source === "auto" ? "#06b6d4" : "#a1a1aa";

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
      }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[hovered ? 0.14 : 0.09, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 1.2 : 0.5}
      />
    </mesh>
  );
};

const Scene = ({
  memories,
  similarity,
  onSelect,
}: {
  memories: Memoryitem[];
  similarity: { id: string; relatedIds: string[] }[];
  onSelect: (m: Memoryitem) => void;
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
      <GlobeCore />
      <Edges positionById={positionById} similarity={similarity} />
      {memories.map((memory, i) => (
        <MemoryNode key={memory.id} position={positions[i]} memory={memory} onSelect={onSelect} />
      ))}
      <Controls />
    </>
  );
};

export const MemoryGlobe = () => {
  const { data: memories = [] } = useMemories();
  const { data: similarity = [] } = useMemorySimilarity(memories.length > 0);
  const [selected, setSelected] = useState<Memoryitem | null>(null);

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

  return (
    <div className="relative w-full h-105 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <Scene memories={memories} similarity={similarity} onSelect={setSelected} />
      </Canvas>

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
