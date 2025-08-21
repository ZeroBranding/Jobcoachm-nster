"use client";
import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { motion } from "framer-motion";
import Link from "next/link";

function HologramSphere() {
  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.2}>
      <mesh>
        <icosahedronGeometry args={[1.4, 2]} />
        <meshStandardMaterial
          color="#00D1FF"
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <HologramSphere />
        </Canvas>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass rounded-2xl p-8 md:p-12 max-w-2xl text-center shadow-2xl"
      >
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          JobCoach Münster
        </h1>
        <p className="mt-4 text-slate-300">
          Wir unterstützen dich bei Anträgen: ALG I/II, Kindergeld, Wohngeld, BAföG
          und mehr – digital, rechtssicher und verständlich.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/formulare" className="px-5 py-3 rounded-xl bg-primary/20 border border-primary/40 hover:bg-primary/30 transition-colors">
            Formulare ansehen
          </Link>
          <Link href="/kontakt" className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
            Kontakt aufnehmen
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

