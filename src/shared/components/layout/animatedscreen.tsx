import { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import MultimateLogo from "../../assets/Multimate.png";

function ParticleField({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 2000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 8;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    const attr = ref.current.geometry.getAttribute("position");
    const mouseX = state.pointer.x * 3;
    const mouseY = state.pointer.y * 3;

    for (let i = 0; i < attr.count; i++) {
      let x = attr.getX(i);
      let y = attr.getY(i);
      let z = attr.getZ(i);

      const dx = mouseX - x;
      const dy = mouseY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3) {
        const force = (3 - dist) / 3;
        x -= (dx / dist) * force * 0.02;
        y -= (dy / dist) * force * 0.02;
      }

      x += Math.sin(time * 0.1 + i) * 0.0005;
      y += Math.cos(time * 0.08 + i * 0.5) * 0.0005;
      z += Math.sin(time * 0.06 + i * 0.3) * 0.0005;

      const radius = Math.sqrt(x * x + y * y + z * z);
      if (radius > 10) {
        const norm = 10 / radius;
        x *= norm;
        y *= norm;
        z *= norm;
      }

      attr.setXYZ(i, x, y, z);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={isDark ? "#22d3ee" : "#0891b2"}
        transparent
        opacity={isDark ? 0.6 : 0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingShape({
  isDark,
  position,
  color,
  scale = 1,
  rotSpeed = 0.2,
  boxArgs,
}: {
  isDark: boolean;
  position: [number, number, number];
  color: string;
  scale?: number;
  rotSpeed?: number;
  boxArgs?: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);
  const startPos = useMemo(() => new THREE.Vector3(...position), []);
  const args = boxArgs ?? [0.5 * scale, 0.5 * scale, 0.5 * scale];

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    ref.current.rotation.x += 0.003 * rotSpeed;
    ref.current.rotation.y += 0.005 * rotSpeed;
    ref.current.rotation.z += 0.002 * rotSpeed;

    const offsetY = Math.sin(time * 0.3 + position[0]) * 0.4;
    const offsetX = Math.cos(time * 0.25 + position[1]) * 0.3;
    ref.current.position.x = startPos.x + offsetX;
    ref.current.position.y = startPos.y + offsetY;
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={args} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={isDark ? 0.25 : 0.15}
        metalness={0.3}
        roughness={0.1}
        wireframe
        emissive={color}
        emissiveIntensity={isDark ? 0.15 : 0.05}
      />
    </mesh>
  );
}

function BrandLogo() {
  const texture = useLoader(THREE.TextureLoader, MultimateLogo);
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const breathe = 1 + Math.sin(state.clock.getElapsedTime() * 0.4) * 0.03;
    ref.current.scale.setScalar(breathe);
  });

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={ref} position={[0, 0, 0]}>
        <planeGeometry args={[2 * aspect, 2]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ConnectingLines({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.LineSegments>(null);
  const count = 60;

  const positions = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const r1 = 1.5 + Math.random() * 0.5;
      const r2 = 2.5 + Math.random() * 0.5;
      pts.push(
        Math.cos(a) * r1,
        Math.sin(a) * r1,
        0,
        Math.cos(a + 0.1) * r2,
        Math.sin(a + 0.1) * r2,
        0,
      );
    }
    return new Float32Array(pts);
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.getElapsedTime() * 0.04;
  });

  return (
    <lineSegments ref={ref} position={[0, 0, -0.5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={isDark ? "#22d3ee" : "#0891b2"}
        transparent
        opacity={isDark ? 0.12 : 0.08}
        depthWrite={false}
      />
    </lineSegments>
  );
}

export const AiWaveformScene = ({ theme = "light" }: { theme?: string }) => {
  const isDark = theme === "dark";

  return (
    <div className="w-full h-full min-h-screen relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, 7], fov: 50, near: 0.1, far: 30 }}>
        <color attach="background" args={[isDark ? "#0a0a0f" : "#f8fafc"]} />

        <BrandLogo />
        <ConnectingLines isDark={isDark} />

        <FloatingShape
          isDark={isDark}
          position={[-2.2, 1.5, -1]}
          color="#22d3ee"
          scale={1}
          rotSpeed={0.3}
          boxArgs={[0.9, 0.5, 0.3]}
        />
        <FloatingShape
          isDark={isDark}
          position={[2.5, -1.2, 0]}
          color="#8b5cf6"
          scale={0.7}
          rotSpeed={0.5}
          boxArgs={[0.5, 0.5, 0.8]}
        />
        <FloatingShape
          isDark={isDark}
          position={[-2.8, -1.8, 1]}
          color="#06b6d4"
          scale={0.6}
          rotSpeed={0.4}
          boxArgs={[0.8, 0.6, 0.4]}
        />
        <FloatingShape
          isDark={isDark}
          position={[2, 2, -0.5]}
          color="#a78bfa"
          scale={0.5}
          rotSpeed={0.6}
          boxArgs={[0.4, 0.7, 0.4]}
        />
        <FloatingShape
          isDark={isDark}
          position={[0.5, -2.5, 1.5]}
          color="#22d3ee"
          scale={0.4}
          rotSpeed={0.35}
          boxArgs={[0.6, 0.3, 0.6]}
        />
        <FloatingShape
          isDark={isDark}
          position={[-1, 2.8, 2]}
          color="#8b5cf6"
          scale={0.35}
          rotSpeed={0.45}
          boxArgs={[0.35, 0.35, 0.7]}
        />

        <ParticleField isDark={isDark} />

        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 5]} intensity={0.3} color="#22d3ee" />
      </Canvas>
    </div>
  );
};
