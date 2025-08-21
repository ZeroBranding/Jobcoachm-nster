'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const Footer: React.FC = () => {
  const footerLinks = {
    services: [
      { href: '/services/alg', label: 'Arbeitslosengeld' },
      { href: '/services/kindergeld', label: 'Kindergeld' },
      { href: '/services/wohngeld', label: 'Wohngeld' },
    ],
    company: [
      { href: '/about', label: 'Über uns' },
      { href: '/contact', label: 'Kontakt' },
      { href: '/careers', label: 'Karriere' },
    ],
    legal: [
      { href: '/legal/agb', label: 'AGB' },
      { href: '/legal/datenschutz', label: 'Datenschutz' },
      { href: '/legal/impressum', label: 'Impressum' },
    ],
    support: [
      { href: '/help', label: 'Hilfe' },
      { href: '/faq', label: 'FAQ' },
      { href: '/status', label: 'System Status' },
    ],
  }

  return (
    <footer className="relative mt-20 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">JC</span>
              </div>
              <span className="text-xl font-bold gradient-text">JobCoach</span>
            </div>
            <p className="text-sm text-gray-400">
              Ihr digitaler Karrierebegleiter für alle Lebenslagen.
            </p>
            <div className="flex space-x-4 mt-4">
              {/* Social Media Icons */}
              {['twitter', 'linkedin', 'facebook'].map((social) => (
                <motion.a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  className="w-8 h-8 glass-effect rounded-full flex items-center justify-center hover:bg-white/20"
                >
                  <span className="text-xs">{social[0].toUpperCase()}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4 text-gray-300 capitalize">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 JobCoach. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-gray-500">Made with ❤️ in Germany</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer