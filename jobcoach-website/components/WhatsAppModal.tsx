'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface WhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
  phoneNumber?: string
  message?: string
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ 
  isOpen, 
  onClose, 
  phoneNumber = '491234567890',
  message = 'Hallo, ich interessiere mich für JobCoach!'
}) => {
  const [consent, setConsent] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!consent) {
      setError('Bitte stimmen Sie der WhatsApp-Kommunikation zu')
      return
    }
    
    if (!phoneInput || phoneInput.length < 10) {
      setError('Bitte geben Sie eine gültige Telefonnummer ein')
      return
    }
    
    // Store consent in localStorage
    localStorage.setItem('whatsapp_consent', 'true')
    localStorage.setItem('whatsapp_consent_date', new Date().toISOString())
    localStorage.setItem('whatsapp_phone', phoneInput)
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    
    // Close modal
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            data-testid="whatsapp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-modal-title"
          >
            <div className="glass-effect p-8 rounded-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 id="whatsapp-modal-title" className="text-2xl font-bold gradient-text">
                  WhatsApp-Kontakt
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Modal schließen"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              {/* Content */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-gray-300 mb-4">
                    Für eine persönliche Beratung via WhatsApp benötigen wir Ihre Einwilligung 
                    und Telefonnummer.
                  </p>
                  
                  {/* WhatsApp Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.878c-.242.695-.48 1.413-2.006 1.413-.512.076-1.16.108-1.872-.118-.431-.137-.985-.32-1.694-.626-2.981-1.287-4.927-4.289-5.076-4.487-.148-.198-1.213-1.612-1.213-3.074s.643-2.182 1.04-2.479c.272-.298.594-.372.792-.372l.57.01c.182.009.427-.069.669.51.247.595.841 2.058.916 2.206.075.149.124.323.025.521-.1.199-.149.323-.3.495-.149.174-.312.388-.446.521-.148.148-.303.308-.13.606.173.298.77 1.271 1.653 2.059 1.135 1.013 2.093 1.326 2.39 1.475.297.149.471.125.644-.074.173-.198.743-.867.94-1.164.199-.298.397-.248.67-.149.272.1 1.733.818 2.03.967.297.149.495.223.57.347.074.124.074.719-.173 1.414z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Phone Input */}
                <div>
                  <label htmlFor="phone" className="form-label">
                    Ihre Telefonnummer *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value)
                      setError('')
                    }}
                    placeholder="+49 123 456789"
                    className="form-input"
                    required
                  />
                </div>
                
                {/* Consent Checkbox */}
                <div className="space-y-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked)
                        setError('')
                      }}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      data-testid="whatsapp-consent"
                    />
                    <span className="text-sm text-gray-300">
                      Ich stimme zu, dass JobCoach mich über WhatsApp kontaktieren darf. 
                      Diese Einwilligung kann ich jederzeit widerrufen. Es gelten unsere{' '}
                      <a href="/legal/datenschutz" className="text-blue-400 hover:underline">
                        Datenschutzbestimmungen
                      </a>.
                    </span>
                  </label>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm" role="alert" aria-live="polite">
                      {error}
                    </p>
                  </div>
                )}
                
                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 button-secondary"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 button-primary"
                    data-testid="whatsapp-link"
                  >
                    Weiter zu WhatsApp
                  </button>
                </div>
              </form>
              
              {/* Info */}
              <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
                <p className="text-xs text-gray-400">
                  <strong>Hinweis:</strong> WhatsApp ist ein Service der Meta Platforms Inc. 
                  Ihre Daten werden gemäß den WhatsApp-Datenschutzrichtlinien verarbeitet.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default WhatsAppModal