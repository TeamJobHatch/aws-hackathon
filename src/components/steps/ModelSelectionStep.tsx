'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import ModelSelector from '../ModelSelector'

interface ModelSelectionStepProps {
  state: any
  updateState: (updates: any) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
}

export default function ModelSelectionStep({ 
  state, 
  updateState, 
  goToNextStep, 
  goToPreviousStep 
}: ModelSelectionStepProps) {

  const handleModelChange = (model: 'openai' | 'gemini') => {
    updateState({ selectedAIModel: model })
  }

  const canProceed = state.selectedAIModel && state.jobDescription

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Select AI Model
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Choose the AI model that will analyze your candidates. Each model has unique strengths for different analysis requirements.
          </motion.p>
        </div>

        {/* Model Selector Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ModelSelector
            selectedModel={state.selectedAIModel}
            onModelChange={handleModelChange}
            disabled={false}
          />
        </motion.div>

        {/* Additional Information */}
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens next?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Analysis Process</h4>
              <ul className="space-y-1">
                <li>• Resume text extraction and parsing</li>
                <li>• Skill matching against job requirements</li>
                <li>• Experience evaluation and scoring</li>
                <li>• Detailed insights and recommendations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Results Delivered</h4>
              <ul className="space-y-1">
                <li>• Ranked candidate list with match scores</li>
                <li>• Detailed analysis for each candidate</li>
                <li>• Strengths, weaknesses, and recommendations</li>
                <li>• Technical and soft skills assessment</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div 
          className="flex justify-between items-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={goToPreviousStep}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </motion.button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Selected: <span className="font-medium text-gray-900">
                {state.selectedAIModel === 'openai' ? 'OpenAI GPT-4o' : 'Google Gemini 2.5'}
              </span>
            </p>
            {!canProceed && (
              <p className="text-xs text-amber-600">
                Please ensure you have a job description and model selected
              </p>
            )}
          </div>

          <motion.button
            onClick={goToNextStep}
            disabled={!canProceed}
            className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              canProceed
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={canProceed ? { scale: 1.02, x: 2 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
          >
            <span>Continue</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
} 