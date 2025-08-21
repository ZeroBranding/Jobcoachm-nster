'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'
import Navigation from '@/components/Navigation'
import Services from '@/components/Services'
import Footer from '@/components/Footer'
import LoadingScreen from '@/components/LoadingScreen'

const ParticlesBackground = dynamic(() => import('@/components/ParticlesBackground'), {
  ssr: false,
})

const HologramIntro = dynamic(() => import('@/components/3d/HologramIntro'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 4000)

    const loadTimer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearTimeout(loadTimer)
    }
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
        <ParticlesBackground />
      </div>

      {/* Hologram Intro */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <Suspense fallback={<LoadingScreen />}>
            <HologramIntro onComplete={() => setShowIntro(false)} />
          </Suspense>
        </div>
      )}

      {/* Main Content */}
      {!showIntro && (
        <div className="relative z-10">
          <Navigation />
          <Hero />
          <Services />
          <Footer />
        </div>
      )}
    </main>
  )
}