'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const FloatingLogo = dynamic(() => import('./3d/FloatingLogo'), {
  ssr: false,
})

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">JobCoach</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Ihr digitaler Karrierebegleiter für alle Lebenslagen
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Professionelle Unterstützung bei Anträgen für Arbeitslosengeld, 
              Kindergeld und Wohngeld. Schnell, sicher und vollständig digital.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/services" className="button-primary">
                Jetzt starten
              </Link>
              <Link href="/about" className="button-secondary">
                Mehr erfahren
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                { number: '100%', label: 'Digital' },
                { number: '24/7', label: 'Verfügbar' },
                { number: 'DSGVO', label: 'Konform' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.2 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold gradient-text">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - 3D Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative h-[400px] lg:h-[500px]"
          >
            <FloatingLogo />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero