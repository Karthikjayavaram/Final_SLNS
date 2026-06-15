'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const [count, setCount] = useState(800);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCount(window.innerWidth < 768 ? 400 : 1000);
    }
  }, []);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = Math.random() * 2 + 0.5;
    }
    return s;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.02;
    meshRef.current.rotation.x = Math.sin(time * 0.01) * 0.1;

    const posArray = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3 + 1] += Math.sin(time * 0.3 + i * 0.1) * 0.002;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#D4B56B"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function GoldParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0A0A0A] to-black" />
    );
  }

  return (
    <div className="particle-canvas">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
