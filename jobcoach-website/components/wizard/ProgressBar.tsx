import React from 'react'
import { motion } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/24/solid'

interface ProgressBarProps {
  steps: string[]
  currentStep: number
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep, className = '' }) => {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-6">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Steps */}
      <div className="hidden md:flex justify-between relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index === 0 ? 'items-start' : index === steps.length - 1 ? 'items-end' : ''
              }`}
            >
              {/* Step indicator */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  transition-all duration-300 mb-2
                  ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                      : 'bg-gray-700 text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>

              {/* Step label */}
              <span
                className={`
                  text-xs text-center max-w-[100px]
                  ${
                    isCompleted
                      ? 'text-green-400'
                      : isCurrent
                      ? 'text-blue-400 font-semibold'
                      : 'text-gray-500'
                  }
                `}
              >
                {step}
              </span>

              {/* Connection line (except for last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    absolute top-5 w-full h-0.5 -z-10
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}
                  `}
                  style={{
                    left: `${(100 / (steps.length - 1)) * index}%`,
                    width: `${100 / (steps.length - 1)}%`,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile step indicator */}
      <div className="md:hidden text-center">
        <span className="text-sm text-gray-400">
          Schritt {currentStep + 1} von {steps.length}
        </span>
        <h3 className="text-lg font-semibold text-white mt-1">{steps[currentStep]}</h3>
      </div>
    </div>
  )
}

export default ProgressBar