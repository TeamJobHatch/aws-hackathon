'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface ChainOfThoughtStep {
  id: string
  message: string
  timestamp: number
  status: 'processing' | 'completed' | 'error'
  type?: 'linkedin' | 'github' | 'resume' | 'general'
}

interface ChainOfThoughtDisplayProps {
  steps: ChainOfThoughtStep[]
  isAnalyzing: boolean
  title?: string
}

export default function ChainOfThoughtDisplay({ 
  steps, 
  isAnalyzing, 
  title = "AI Analysis Process" 
}: ChainOfThoughtDisplayProps) {
  const [visibleSteps, setVisibleSteps] = useState<ChainOfThoughtStep[]>([])

  useEffect(() => {
    // Directly set visible steps without animation delays for better performance
    setVisibleSteps(steps)
  }, [steps])

  const getStepIcon = (step: ChainOfThoughtStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Clock className="h-4 w-4 text-blue-500" />
          </motion.div>
        )
    }
  }

  const getStepColor = (step: ChainOfThoughtStep) => {
    switch (step.type) {
      case 'linkedin':
        return 'border-l-blue-500 bg-blue-50'
      case 'github':
        return 'border-l-purple-500 bg-purple-50'
      case 'resume':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-400 bg-gray-50'
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  if (!isAnalyzing && visibleSteps.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <motion.div
          animate={isAnalyzing ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
        >
          <Brain className="h-5 w-5 text-blue-600" />
        </motion.div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {isAnalyzing && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm text-blue-600 font-medium"
          >
            Analyzing...
          </motion.div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {visibleSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05
              }}
              className={`p-3 border-l-4 rounded-lg ${getStepColor(step)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {step.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTime(step.timestamp)}
                    </span>
                    {step.type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        step.type === 'linkedin' ? 'bg-blue-100 text-blue-700' :
                        step.type === 'github' ? 'bg-purple-100 text-purple-700' :
                        step.type === 'resume' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Summary */}
      {visibleSteps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Progress: {visibleSteps.filter(s => s.status === 'completed').length} / {visibleSteps.length} steps
            </span>
            <div className="flex space-x-4">
              <span className="text-green-600">
                ✓ {visibleSteps.filter(s => s.status === 'completed').length} completed
              </span>
              {visibleSteps.filter(s => s.status === 'error').length > 0 && (
                <span className="text-red-600">
                  ⚠ {visibleSteps.filter(s => s.status === 'error').length} errors
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
} 