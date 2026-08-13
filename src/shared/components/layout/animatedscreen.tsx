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
        size={0.035}
        color={isDark ? "#22d3ee" : "#0891b2"}
        transparent
        opacity={isDark ? 0.55 : 0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
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
    <mesh ref={ref} position={[0, 0, 0]}>
      <planeGeometry args={[2 * aspect, 2]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export const AiWaveformScene = ({ theme = "light" }: { theme?: string }) => {
  const isDark = theme === "dark";
  const bg = isDark ? "#0a0a0f" : "#f8fafc";

  return (
    <div className="w-full h-full min-h-screen relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 45%, rgba(34,211,238,0.14), transparent 60%)"
            : "radial-gradient(circle at 50% 45%, rgba(8,145,178,0.10), transparent 60%)",
        }}
      />
      <Canvas camera={{ position: [0, 0, 7], fov: 50, near: 0.1, far: 30 }}>
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, 6, 15]} />

        <BrandLogo />
        <ParticleField isDark={isDark} />

        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 5]} intensity={0.4} color="#22d3ee" />
      </Canvas>
    </div>
  );
};
