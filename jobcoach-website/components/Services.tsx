'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BriefcaseIcon, 
  HomeIcon, 
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const Services: React.FC = () => {
  const services = [
    {
      id: 'alg',
      title: 'Arbeitslosengeld (ALG)',
      description: 'Unterstützung bei der Beantragung von ALG I und ALG II. Vollständige digitale Abwicklung mit allen erforderlichen Formularen.',
      icon: BriefcaseIcon,
      color: 'from-blue-400 to-blue-600',
      href: '/services/alg',
      features: ['Automatische Berechnung', 'Digitale Signatur', 'Dokumenten-Upload'],
    },
    {
      id: 'kindergeld',
      title: 'Kindergeld',
      description: 'Einfache und schnelle Beantragung von Kindergeld. Alle Formulare digital ausfüllen und direkt einreichen.',
      icon: UserGroupIcon,
      color: 'from-green-400 to-green-600',
      href: '/services/kindergeld',
      features: ['Familienfreundlich', 'Schnelle Bearbeitung', 'Statusverfolgung'],
    },
    {
      id: 'wohngeld',
      title: 'Wohngeld',
      description: 'Professionelle Hilfe bei der Wohngeldbeantragung. Berechnung des Anspruchs und digitale Einreichung.',
      icon: HomeIcon,
      color: 'from-purple-400 to-purple-600',
      href: '/services/wohngeld',
      features: ['Anspruchsberechnung', 'Mietbescheinigung', 'Einkommensnachweis'],
    },
  ]

  const benefits = [
    {
      icon: DocumentTextIcon,
      title: 'Digitale Formulare',
      description: 'Alle Anträge vollständig digital ausfüllen',
    },
    {
      icon: ShieldCheckIcon,
      title: 'DSGVO-konform',
      description: 'Höchste Datenschutzstandards garantiert',
    },
    {
      icon: ClockIcon,
      title: '24/7 Verfügbar',
      description: 'Jederzeit Anträge stellen und bearbeiten',
    },
  ]

  return (
    <section id="services" className="relative py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Unsere Services</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Professionelle Unterstützung bei allen wichtigen Sozialleistungen - 
            schnell, sicher und vollständig digital
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group"
              >
                <Link href={service.href}>
                  <div className="glass-effect p-8 h-full card-3d hover:border-white/40 transition-all duration-300">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${service.color} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                    <p className="text-gray-400 mb-6">{service.description}</p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm text-gray-300">
                          <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                      <span className="mr-2">Jetzt beantragen</span>
                      <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-effect p-8 rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-center mb-8">Ihre Vorteile</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}