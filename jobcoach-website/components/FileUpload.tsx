'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  required?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png'],
  required = false,
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `Datei "${file.name}" ist zu groß (max. ${maxSizeMB}MB)`
    }

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      const allowedExtensions = acceptedTypes.map(type => {
        const parts = type.split('/')
        return parts[1].toUpperCase()
      }).join(', ')
      return `Datei "${file.name}" hat ungültigen Typ (erlaubt: ${allowedExtensions})`
    }

    return null
  }

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    setError('')
    const fileArray = Array.from(newFiles)
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximal ${maxFiles} Dateien erlaubt`)
      return
    }

    // Validate each file
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      setError(errors.join('. '))
      return
    }

    const updatedFiles = [...files, ...validFiles]
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return '🖼️'
    } else if (type === 'application/pdf') {
      return '📄'
    }
    return '📎'
  }

  return (
    <div className="space-y-4">
      <label className="form-label">
        Dokumente hochladen {required && '*'}
      </label>

      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive 
            ? 'border-blue-400 bg-blue-400/10' 
            : 'border-white/20 hover:border-white/40'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        data-testid="file-upload"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className="sr-only"
          id="file-upload-input"
          aria-label="Dateien auswählen"
          aria-required={required}
          aria-describedby="file-upload-description"
        />

        <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        <label
          htmlFor="file-upload-input"
          className="cursor-pointer"
        >
          <span className="text-lg font-medium text-white">
            Dateien hier ablegen oder{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              durchsuchen
            </button>
          </span>
        </label>

        <p id="file-upload-description" className="text-sm text-gray-400 mt-2">
          PDF, JPEG, PNG bis {maxSizeMB}MB • Max. {maxFiles} Dateien
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
            role="alert"
            aria-live="polite"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-gray-300">
              Hochgeladene Dateien ({files.length}/{maxFiles})
            </p>
            
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 glass-effect rounded-lg"
                data-testid="uploaded-file"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl" role="img" aria-label={`Dateitype ${file.type}`}>
                    {getFileIcon(file.type)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label={`Datei ${file.name} entfernen`}
                >
                  <XMarkIcon className="w-5 h-5 text-red-400" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {files.length > 0 
          ? `${files.length} Datei${files.length !== 1 ? 'en' : ''} hochgeladen`
          : 'Keine Dateien hochgeladen'
        }
      </div>
    </div>
  )
}

export default FileUpload