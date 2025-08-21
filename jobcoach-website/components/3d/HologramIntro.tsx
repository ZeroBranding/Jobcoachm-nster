'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text3D, Center, OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'

interface HologramIntroProps {
  onComplete?: () => void
}

function HologramText() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  useEffect(() => {
    if (meshRef.current) {
      gsap.from(meshRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power4.out',
      })
      gsap.from(meshRef.current.rotation, {
        x: Math.PI,
        duration: 1.5,
        ease: 'power2.out',
      })
    }
  }, [])

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Center>
        <mesh ref={meshRef}>
          <textGeometry args={['JobCoach', { size: 1.5, height: 0.3 }]} />
          <meshStandardMaterial
            ref={materialRef}
            color="#3B82F6"
            emissive="#3B82F6"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Center>
    </Float>
  )
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)
  const particleCount = 1000

  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#3B82F6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Fallback component for reduced motion or low performance
const FallbackIntro: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center"
      data-testid="3d-fallback"
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold gradient-text animate-pulse">JobCoach</h1>
        <p className="text-xl text-gray-300 mt-4">Ihr digitaler Karrierebegleiter</p>
      </div>
    </div>
  )
}

const HologramIntro: React.FC<HologramIntroProps> = ({ onComplete }) => {
  const [shouldUse3D, setShouldUse3D] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Check for low performance indicators
    const isLowEnd = navigator.hardwareConcurrency <= 2
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Check WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    const hasWebGL = !!gl
    
    // Determine if we should use 3D
    setShouldUse3D(!prefersReducedMotion && !isLowEnd && hasWebGL && !isMobile)

    const timer = setTimeout(() => {
      onComplete?.()
    }, 3500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (hasError || !shouldUse3D) {
    return <FallbackIntro onComplete={onComplete} />
  }

  return (
    <div className="w-full h-full bg-black">
      <button
        onClick={() => onComplete?.()}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        data-testid="skip-intro"
      >
        Überspringen
      </button>
      
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]} // Limit DPR for performance
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
        }}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
        
        <HologramText />
        <ParticleField />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Hologram effect */}
        <mesh scale={[20, 20, 1]} position={[0, 0, -5]}>
          <planeGeometry />
          <meshBasicMaterial color="#000033" transparent opacity={0.3} />
        </mesh>
      </Canvas>

      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59, 130, 246, 0.3) 2px, rgba(59, 130, 246, 0.3) 4px)',
            animation: 'scanlines 8s linear infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
      `}</style>
    </div>
  )
}

export default HologramIntro