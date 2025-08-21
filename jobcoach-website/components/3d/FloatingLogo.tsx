'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Box, Sphere, Torus, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function LogoMesh() {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.5
      sphereRef.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group ref={groupRef}>
        {/* Central Sphere */}
        <Sphere ref={sphereRef} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#3B82F6"
            emissive="#3B82F6"
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.8}
            distort={0.3}
            speed={2}
          />
        </Sphere>

        {/* Orbiting Torus */}
        <Torus args={[1.5, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#8B5CF6"
            emissive="#8B5CF6"
            emissiveIntensity={0.3}
            metalness={1}
            roughness={0}
          />
        </Torus>

        {/* Orbiting Boxes */}
        {[0, 120, 240].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          return (
            <Box
              key={i}
              args={[0.3, 0.3, 0.3]}
              position={[Math.cos(rad) * 2, 0, Math.sin(rad) * 2]}
            >
              <meshStandardMaterial
                color={['#10B981', '#F59E0B', '#EF4444'][i]}
                emissive={['#10B981', '#F59E0B', '#EF4444'][i]}
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.2}
              />
            </Box>
          )
        })}

        {/* Particle Field around logo */}
        <Points />
      </group>
    </Float>
  )
}

function Points() {
  const ref = useRef<THREE.Points>(null)
  const particleCount = 200

  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    const radius = 2 + Math.random() * 1

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

const FloatingLogo: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#3B82F6" />
      
      <LogoMesh />
      
      {/* Background glow */}
      <mesh scale={[10, 10, 1]} position={[0, 0, -3]}>
        <planeGeometry />
        <meshBasicMaterial
          color="#3B82F6"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Canvas>
  )
}

export default FloatingLogo