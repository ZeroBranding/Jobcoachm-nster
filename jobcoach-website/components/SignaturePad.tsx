'use client'

import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { motion } from 'framer-motion'

interface SignaturePadProps {
  onSave: (signature: string) => void
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const clear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
    onSave('')
  }

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL()
      onSave(dataURL)
      setIsEmpty(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="glass-effect p-2 rounded-lg">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: 'w-full h-40 bg-white/5 rounded-lg cursor-crosshair',
              style: { touchAction: 'none' },
            }}
            backgroundColor="rgba(255, 255, 255, 0.05)"
            penColor="white"
            onEnd={save}
          />
        </div>
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-500">Bitte hier unterschreiben</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={clear}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Löschen
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={save}
          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
        >
          Speichern
        </motion.button>
      </div>
    </div>
  )
}

export default SignaturePad