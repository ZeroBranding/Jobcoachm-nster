'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const MenuButton3D = dynamic(() => import('./3d/MenuButton3D'), {
  ssr: false,
  loading: () => (
    <div className="w-32 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg animate-pulse" />
  ),
})

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleMotionChange)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      mediaQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  const menuItems = [
    { href: '/', label: 'Home', color: '#3B82F6' },
    { href: '/services/alg', label: 'ALG', color: '#10B981' },
    { href: '/services/kindergeld', label: 'Kindergeld', color: '#F59E0B' },
    { href: '/services/wohngeld', label: 'Wohngeld', color: '#EF4444' },
    { href: '/about', label: 'Über uns', color: '#8B5CF6' },
    { href: '/contact', label: 'Kontakt', color: '#EC4899' },
  ]

  return (
    <>
      {/* Skip to content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        data-testid="skip-to-content"
      >
        Zum Hauptinhalt springen
      </a>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'glass-effect py-2' : 'py-4'
        }`}
        role="navigation"
        aria-label="Hauptnavigation"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg p-1"
              aria-label="JobCoach Startseite"
            >
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">JC</span>
              </motion.div>
              <span className="text-2xl font-bold gradient-text">JobCoach</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2" role="menubar">
              {menuItems.map((item, index) => (
                prefersReducedMotion ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ color: item.color }}
                    role="menuitem"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <MenuButton3D
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    color={item.color}
                    delay={index * 0.1}
                  />
                )
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center space-y-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg"
              aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <motion.span
                animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 6 : 0 }}
                className="w-6 h-0.5 bg-white"
              />
              <motion.span
                animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                className="w-6 h-0.5 bg-white"
              />
              <motion.span
                animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -6 : 0 }}
                className="w-6 h-0.5 bg-white"
              />
            </button>
          </div>

          {/* Mobile Menu */}
          <motion.div
            id="mobile-menu"
            initial={false}
            animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
            className="md:hidden overflow-hidden"
            role="menu"
          >
            <div className="py-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 glass-effect rounded-lg hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  role="menuitem"
                >
                  <span style={{ color: item.color }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.nav>
    </>
  )
}