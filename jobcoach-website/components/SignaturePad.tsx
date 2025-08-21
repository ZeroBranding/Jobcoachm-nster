'use client'

import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { motion } from 'framer-motion'

interface SignaturePadProps {
  onSave: (signature: string) => void
  required?: boolean
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, required = false }) => {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // Announce to screen readers
    if (isSaved) {
      const announcement = document.createElement('div')
      announcement.setAttribute('role', 'status')
      announcement.setAttribute('aria-live', 'polite')
      announcement.className = 'sr-only'
      announcement.textContent = 'Unterschrift wurde gespeichert'
      document.body.appendChild(announcement)
      
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }, [isSaved])

  const clear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
    setIsSaved(false)
    onSave('')
  }

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL()
      onSave(dataURL)
      setIsEmpty(false)
      setIsSaved(true)
    }
  }

  const handleEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      save()
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <label htmlFor="signature-canvas" className="form-label">
          Digitale Unterschrift {required && '*'}
        </label>
        
        <div className="glass-effect p-2 rounded-lg">
          <div 
            className="relative"
            role="img"
            aria-label="Unterschriftsfeld"
          >
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'w-full h-40 bg-white/5 rounded-lg cursor-crosshair',
                style: { touchAction: 'none' },
                id: 'signature-canvas',
              }}
              backgroundColor="rgba(255, 255, 255, 0.05)"
              penColor="white"
              onEnd={handleEnd}
            />
            
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-500">Bitte hier unterschreiben</p>
              </div>
            )}
            
            {isSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-2 right-2 bg-green-500/20 px-3 py-1 rounded-full"
              >
                <span className="text-green-400 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Gespeichert
                </span>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Instructions for screen readers */}
        <div className="sr-only" role="region" aria-label="Anweisungen für die digitale Unterschrift">
          <p>
            Verwenden Sie die Maus oder Ihren Finger, um im Feld zu unterschreiben. 
            Drücken Sie die Tab-Taste, um zu den Aktionsbuttons zu gelangen.
          </p>
        </div>
      </div>
      
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={clear}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Unterschrift löschen"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Löschen
          </span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={save}
          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Unterschrift speichern"
          disabled={isEmpty}
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Speichern
          </span>
        </motion.button>
      </div>
      
      {/* Status for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isEmpty ? 'Unterschriftsfeld ist leer' : 'Unterschrift vorhanden'}
      </div>
    </div>
  )
}

export default SignaturePad