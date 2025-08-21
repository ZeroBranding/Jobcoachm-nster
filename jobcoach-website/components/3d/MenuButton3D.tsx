'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Text } from '@react-three/drei'
import * as THREE from 'three'

interface MenuButton3DProps {
  href: string
  label: string
  color: string
  delay?: number
}

function Button3D({ color, isHovered }: { color: string; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = isHovered ? Math.sin(state.clock.elapsedTime * 2) * 0.1 : 0
      meshRef.current.rotation.y = isHovered ? Math.cos(state.clock.elapsedTime * 2) * 0.1 : 0
      meshRef.current.scale.x = isHovered ? 1.1 : 1
      meshRef.current.scale.y = isHovered ? 1.1 : 1
      meshRef.current.scale.z = isHovered ? 1.1 : 1
    }
  })

  return (
    <Box ref={meshRef} args={[2, 0.5, 0.1]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isHovered ? 0.5 : 0.2}
        metalness={0.8}
        roughness={0.2}
      />
    </Box>
  )
}

const MenuButton3D: React.FC<MenuButton3DProps> = ({ href, label, color, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link href={href}>
        <div
          className="relative w-32 h-12 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Button3D color={color} isHovered={isHovered} />
            </Canvas>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white font-semibold text-sm drop-shadow-lg">{label}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default MenuButton3D