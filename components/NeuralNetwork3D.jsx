'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated Neural Node
function NeuralNode({ position, color, speed }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

// Connection Lines between nodes
function Connections({ nodes }) {
  const linesRef = useRef();

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const lines = useMemo(() => {
    const lineGeometries = [];

    // Create connections between random nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.7) { // 30% chance of connection
          const points = [
            new THREE.Vector3(...nodes[i].position),
            new THREE.Vector3(...nodes[j].position),
          ];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          lineGeometries.push(geometry);
        }
      }
    }

    return lineGeometries;
  }, [nodes]);

  return (
    <group ref={linesRef}>
      {lines.map((geometry, index) => (
        <line key={index} geometry={geometry}>
          <lineBasicMaterial attach="material" color="#a78bfa" opacity={0.3} transparent />
        </line>
      ))}
    </group>
  );
}

// Main 3D Scene
function Scene() {
  const groupRef = useRef();

  // Generate random node positions in a sphere
  const nodes = useMemo(() => {
    const nodeArray = [];
    const colors = ['#a78bfa', '#818cf8', '#c084fc', '#e879f9', '#f472b6'];

    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 2;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      nodeArray.push({
        position: [x, y, z],
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.1 + Math.random() * 0.2,
      });
    }

    return nodeArray;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Connections nodes={nodes} />
      {nodes.map((node, index) => (
        <NeuralNode key={index} {...node} />
      ))}

      {/* Central Brain Sphere */}
      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.5}
          speed={1.5}
          roughness={0.1}
          metalness={0.9}
          emissive="#8b5cf6"
          emissiveIntensity={0.3}
        />
      </Sphere>
    </group>
  );
}

// Main Component
export default function NeuralNetwork3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a78bfa" />

        <Scene />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
