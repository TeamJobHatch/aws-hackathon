'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Zap, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { AIModelConfig, ModelTestResults } from '@/types'

interface ModelSelectorProps {
  selectedModel: 'openai' | 'gemini'
  onModelChange: (model: 'openai' | 'gemini') => void
  disabled?: boolean
}

export default function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const [modelStatus, setModelStatus] = useState<ModelTestResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Define model configurations
  const modelConfigs: Record<'openai' | 'gemini', AIModelConfig> = {
    openai: {
      id: 'openai',
      name: 'openai',
      displayName: 'OpenAI GPT-4o',
      description: 'Advanced reasoning and analysis with proven reliability',
      status: 'unknown',
      available: false,
      features: {
        analysis: true,
        embedding: true,
        structured: true
      }
    },
    gemini: {
      id: 'gemini',
      name: 'gemini',
      displayName: 'Google Gemini 1.5',
      description: 'Fast processing with multimodal capabilities',
      status: 'unknown',
      available: false,
      features: {
        analysis: true,
        embedding: true,
        structured: true
      }
    }
  }

  // Test model availability on component mount
  useEffect(() => {
    const testModels = async () => {
      try {
        const response = await fetch('/api/test-ai-models')
        const data: ModelTestResults = await response.json()
        setModelStatus(data)
        
        // Update model configs with real status
        if (data.models) {
          modelConfigs.openai.status = data.models.openai.apiStatus
          modelConfigs.openai.available = data.models.openai.success
          modelConfigs.gemini.status = data.models.gemini.apiStatus
          modelConfigs.gemini.available = data.models.gemini.success
        }
      } catch (error) {
        console.error('Failed to test models:', error)
      } finally {
        setIsLoading(false)
      }
    }

    testModels()
  }, [])

  const getStatusIcon = (status: 'working' | 'limited' | 'error' | 'unknown') => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'limited':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse" />
    }
  }

  const getStatusColor = (status: 'working' | 'limited' | 'error' | 'unknown', isSelected: boolean) => {
    if (disabled) return 'bg-gray-50 border-gray-200 text-gray-400'
    
    if (isSelected) {
      switch (status) {
        case 'working':
          return 'bg-green-50 border-green-500 text-green-900 ring-2 ring-green-500/20'
        case 'limited':
          return 'bg-yellow-50 border-yellow-500 text-yellow-900 ring-2 ring-yellow-500/20'
        case 'error':
          return 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-500/20'
        default:
          return 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
      }
    }

    switch (status) {
      case 'working':
        return 'bg-white border-green-200 text-gray-900 hover:border-green-300'
      case 'limited':
        return 'bg-white border-yellow-200 text-gray-900 hover:border-yellow-300'
      case 'error':
        return 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed'
      default:
        return 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose AI Model</h3>
        <p className="text-sm text-gray-600">Select the AI model for resume analysis</p>
        {modelStatus && (
          <div className="mt-2 text-xs text-gray-500">
            {modelStatus.workingModels} of {modelStatus.totalModels} models available
          </div>
        )}
      </div>

      {/* Model Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(modelConfigs).map(([key, config]) => {
          const typedKey = key as 'openai' | 'gemini'
          const isSelected = selectedModel === typedKey
          const status = modelStatus?.models?.[typedKey]?.apiStatus || 'unknown'
          const isAvailable = modelStatus?.models?.[typedKey]?.success || false
          const canSelect = isAvailable && !disabled

          return (
            <motion.button
              key={typedKey}
              onClick={() => canSelect && onModelChange(typedKey)}
              disabled={!canSelect}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${getStatusColor(status, isSelected)}`}
              whileHover={canSelect ? { scale: 1.02, y: -2 } : {}}
              whileTap={canSelect ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: typedKey === 'openai' ? 0 : 0.1 }}
            >
              {/* Model Icon and Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {typedKey === 'openai' ? (
                    <Brain className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  )}
                  <span className="font-medium">{config.displayName}</span>
                </div>
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse" />
                ) : (
                  getStatusIcon(status)
                )}
              </div>

              {/* Description */}
              <p className="text-sm opacity-75 mb-4">{config.description}</p>

              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs">
                  <Zap className="h-3 w-3" />
                  <span>Resume Analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Brain className="h-3 w-3" />
                  <span>Skill Matching</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Sparkles className="h-3 w-3" />
                  <span>Detailed Insights</span>
                </div>
              </div>

              {/* Status Message */}
              {modelStatus?.models?.[typedKey] && (
                <div className="mt-4 pt-3 border-t border-current/20">
                  <p className="text-xs opacity-75">
                    {modelStatus.models[typedKey].message}
                  </p>
                </div>
              )}

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-3 right-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div className="h-6 w-6 rounded-full bg-current/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </motion.div>
              )}

              {/* Unavailable Overlay */}
              {!canSelect && !isLoading && (
                <div className="absolute inset-0 bg-gray-50/80 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Unavailable</p>
                  </div>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Recommendation */}
      {modelStatus?.recommendation && (
        <motion.div
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start space-x-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Recommendation</h4>
              <p className="text-sm text-blue-700 mt-1">{modelStatus.recommendation}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 