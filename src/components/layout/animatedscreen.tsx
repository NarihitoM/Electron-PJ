import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WaveLine = ({
    isDark,
    offsetY,
    speed = 1,
    amplitude = 0.2,
}: {
    isDark: boolean;
    offsetY: number;
    speed?: number;
    amplitude?: number;
}) => {
    const meshRef = useRef<THREE.Points>(null);

    const [positions, colors] = useMemo(() => {
        const count = 1200; 
        const pos = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const x = (i / count) * 8 - 4; 
            const y = offsetY;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = 0;

            const hue = isDark 
                ? 0.5 + (i / count) * 0.1  
                : 0.45 + (i / count) * 0.15; 
            
            const color = new THREE.Color().setHSL(
                hue, 
                0.8, 
                isDark ? 0.6 : 0.45 
            );

            cols[i * 3] = color.r;
            cols[i * 3 + 1] = color.g;
            cols[i * 3 + 2] = color.b;
        }

        return [pos, cols];
    }, [offsetY, isDark]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        const attr = meshRef.current.geometry.getAttribute("position");

        for (let i = 0; i < attr.count; i++) {
            const x = attr.getX(i);
            const wave =
                Math.sin(x * 1.5 + time * speed) * amplitude +
                Math.cos(x * 3 - time * speed * 0.8) * (amplitude * 0.3);

            attr.setY(i, offsetY + wave);
        }
        attr.needsUpdate = true;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={isDark ? 0.015 : 0.02} 
                vertexColors
                transparent
                opacity={isDark ? 0.4 : 0.7} 
                blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
            />
        </points>
    );
};

const PrismParticles = ({ isDark }: { isDark: boolean }) => {
    const ref = useRef<THREE.Points>(null);
    const count = 800;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        const time = state.clock.getElapsedTime();
        const attr = ref.current.geometry.getAttribute("position");
        for (let i = 0; i < attr.count; i++) {
            const y = attr.getY(i);
            attr.setY(i, y + Math.sin(time * 0.5 + i) * 0.001);
        }
        attr.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color={isDark ? "#22d3ee" : "#0891b2"} 
                transparent
                opacity={isDark ? 0.5 : 0.4}
                blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
            />
        </points>
    );
};

export const AiWaveformScene = ({ theme = "light" }: { theme?: string }) => {
    const isDark = theme === "dark";

    return (
        <div className="w-full h-full min-h-100">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <color attach="background" args={[isDark ? "#000" : "#f0fdff"]} />
                
                <ambientLight intensity={isDark ? 0.5 : 1.5} />
                
                <WaveLine isDark={isDark} offsetY={-4} speed={0.4} amplitude={0.25} />
                <WaveLine isDark={isDark} offsetY={-3.8} speed={0.3} amplitude={0.2} />
                <WaveLine isDark={isDark} offsetY={-3.6} speed={0.5} amplitude={0.15} />
                
                <PrismParticles isDark={isDark} />
            </Canvas>
        </div>
    );
};