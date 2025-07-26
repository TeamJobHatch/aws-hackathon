'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import WelcomeStep from './steps/WelcomeStep'
import JobDescriptionStep from './steps/JobDescriptionStep'
import ConfirmJobDetails from './steps/ConfirmJobDetails'
import ModelSelectionStep from './steps/ModelSelectionStep'
import ResumeUploadStep from './steps/ResumeUploadStep'
import AnalysisProgressStep from './steps/AnalysisProgressStep'
import ResultsStep from './steps/ResultsStep'
import { JobDescription, Resume } from '@/types'

export type WizardStep = 'welcome' | 'job-description' | 'confirm-details' | 'model-selection' | 'resume-upload' | 'analysis' | 'results'

interface HRWizardState {
  currentStep: WizardStep
  jobDescription: JobDescription | null
  resumes: Resume[]
  analysisProgress: number
  analysisSteps: Array<{
    id: string
    title: string
    status: 'pending' | 'active' | 'completed'
    details?: string
  }>
  apiStatus: 'unknown' | 'working' | 'limited' | 'error'
  apiMessage?: string
  selectedAIModel: 'openai' | 'gemini'
}

export default function HRWizard() {
  const [state, setState] = useState<HRWizardState>({
    currentStep: 'welcome',
    jobDescription: null,
    resumes: [],
    analysisProgress: 0,
    analysisSteps: [],
    apiStatus: 'unknown',
    apiMessage: undefined,
    selectedAIModel: 'openai'
  })

  // Test AI models connection on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await fetch('/api/test-ai-models')
        const data = await response.json()
        
        if (data.success && data.workingModels > 0) {
          updateState({ 
            apiStatus: 'working',
            apiMessage: `${data.workingModels} AI model(s) ready`
          })
        } else if (data.workingModels > 0) {
          updateState({ 
            apiStatus: 'limited',
            apiMessage: `${data.workingModels} of ${data.totalModels} models available`
          })
        } else {
          updateState({ 
            apiStatus: 'error',
            apiMessage: 'No AI models available'
          })
        }
      } catch (error) {
        console.error('API test failed:', error)
        updateState({ 
          apiStatus: 'error',
          apiMessage: 'Unable to test AI services'
        })
      }
    }

    // Test API connection after a short delay
    const timer = setTimeout(testApiConnection, 1000)
    return () => clearTimeout(timer)
  }, [])

  const steps: Array<{ id: WizardStep; title: string; description: string }> = [
    { id: 'welcome', title: 'Welcome', description: 'Get started' },
    { id: 'job-description', title: 'Job Description', description: 'Upload or enter job details' },
    { id: 'confirm-details', title: 'Confirm Details', description: 'Review job information' },
    { id: 'model-selection', title: 'AI Model', description: 'Choose analysis model' },
    { id: 'resume-upload', title: 'Upload Resumes', description: 'Add candidate resumes' },
    { id: 'analysis', title: 'AI Analysis', description: 'Processing candidates' },
    { id: 'results', title: 'Results', description: 'View rankings and insights' }
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === state.currentStep)
  }

  const updateState = (updates: Partial<HRWizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const canNavigateToStep = (stepIndex: number): boolean => {
    const currentIndex = getCurrentStepIndex()
    
    // Can always go back to completed steps
    if (stepIndex < currentIndex) return true
    
    // Can go to current step
    if (stepIndex === currentIndex) return true
    
    // Can't jump ahead to future steps
    return false
  }

  const goToStep = (step: WizardStep) => {
    const targetIndex = steps.findIndex(s => s.id === step)
    if (canNavigateToStep(targetIndex)) {
      updateState({ currentStep: step })
    }
  }

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id
      updateState({ currentStep: nextStep })
    }
  }

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1].id
      updateState({ currentStep: prevStep })
    }
  }

  const renderApiStatus = () => {
    if (state.apiStatus === 'unknown') return null

    const statusConfig = {
      working: {
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: '✓',
        text: 'AI Services Online'
      },
      limited: {
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: '⚠',
        text: 'AI Services Limited'
      },
      error: {
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: '✗',
        text: 'AI Services Unavailable'
      }
    }

    const config = statusConfig[state.apiStatus as keyof typeof statusConfig]
    if (!config) return null

    return (
      <motion.div 
        className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl border text-sm font-medium liquid-glass shadow-modern ${config.color}`}
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05, y: -2 }}
      >
        <motion.span 
          className="mr-2"
          animate={{ rotate: state.apiStatus === 'working' ? [0, 360] : 0 }}
          transition={{ 
            duration: state.apiStatus === 'working' ? 2 : 0.3, 
            repeat: state.apiStatus === 'working' ? Infinity : 0 
          }}
        >
          {config.icon}
        </motion.span>
        {config.text}
        {state.apiMessage && (
          <motion.div 
            className="text-xs mt-1 opacity-80"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 0.8, height: 'auto' }}
            transition={{ delay: 0.2 }}
          >
            {state.apiMessage}
          </motion.div>
        )}
      </motion.div>
    )
  }

  const renderStepIndicator = () => {
    const currentIndex = getCurrentStepIndex()
    
    return (
      <motion.div 
        className="flex items-center justify-center space-x-2 sm:space-x-4 mb-8 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="liquid-glass-strong rounded-full px-8 py-6 shadow-modern-lg border border-white/30 gradient-mesh">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {steps.map((step, index) => {
              const isActive = index === currentIndex
              const isCompleted = index < currentIndex
              const canNavigate = canNavigateToStep(index)
              
              return (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  {/* Step Circle Container */}
                  <div className="flex items-center">
                    {/* Connection Line (Before) */}
                    {index > 0 && (
                      <motion.div
                        className={`w-4 sm:w-8 h-0.5 transition-all duration-500 ${
                          steps[index - 1] && getCurrentStepIndex() > index - 1 ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                      />
                    )}

                    {/* Step Circle */}
                    <motion.button
                      onClick={() => canNavigate ? goToStep(step.id) : null}
                      disabled={!canNavigate}
                      className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 font-bold text-sm transition-all duration-300 mx-1 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                          : isActive 
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25' 
                          : 'bg-white border-gray-300 text-gray-500'
                      } ${canNavigate ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'}`}
                      whileHover={canNavigate ? { scale: 1.1 } : {}}
                      whileTap={canNavigate ? { scale: 0.95 } : {}}
                      title={canNavigate ? `Go to ${step.title}` : `Complete previous steps to unlock ${step.title}`}
                    >
                      <AnimatePresence mode="wait">
                        {isCompleted ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                          </motion.div>
                        ) : (
                          <motion.span
                            key="number"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            {index + 1}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Active Step Pulse Effect */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-orange-500"
                          animate={{ 
                            scale: [1, 1.4, 1], 
                            opacity: [0.7, 0, 0.7] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.button>

                    {/* Connection Line (After) */}
                    {index < steps.length - 1 && (
                      <motion.div
                        className={`w-4 sm:w-8 h-0.5 transition-all duration-500 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                      />
                    )}
                  </div>

                  {/* Step Title - Perfectly Centered */}
                  <motion.div
                    className={`text-xs mt-3 hidden sm:block font-medium transition-colors duration-200 text-center whitespace-nowrap ${
                      isActive ? 'text-orange-600' : 
                      isCompleted ? 'text-green-600' : 
                      canNavigate ? 'text-gray-600' : 'text-gray-400'
                    }`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {step.title}
                  </motion.div>

                  {/* Mobile Step Title Tooltip */}
                  <div className="sm:hidden absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {step.title}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Progress Bar */}
          <motion.div 
            className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
            />
          </motion.div>
        </div>
      </motion.div>
    )
  }

  const renderCurrentStep = () => {
    const stepProps = {
      state,
      updateState,
      goToNextStep,
      goToPreviousStep,
      goToStep
    }

    const pageVariants = {
      initial: { 
        opacity: 0, 
        x: 50,
        scale: 0.95
      },
      in: { 
        opacity: 1, 
        x: 0,
        scale: 1
      },
      out: { 
        opacity: 0, 
        x: -50,
        scale: 0.95
      }
    }

    const pageTransition = {
      type: "tween" as const,
      ease: "anticipate" as const,
      duration: 0.4
    }

    const getStepComponent = () => {
      switch (state.currentStep) {
        case 'welcome':
          return <WelcomeStep {...stepProps} />
        case 'job-description':
          return <JobDescriptionStep {...stepProps} />
        case 'confirm-details':
          return <ConfirmJobDetails {...stepProps} />
        case 'model-selection':
          return <ModelSelectionStep {...stepProps} />
        case 'resume-upload':
          return <ResumeUploadStep {...stepProps} />
        case 'analysis':
          return <AnalysisProgressStep {...stepProps} />
        case 'results':
          return <ResultsStep {...stepProps} />
        default:
          return <WelcomeStep {...stepProps} />
      }
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentStep}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {getStepComponent()}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="jobhatch-bg min-h-screen particle-bg relative">
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-20 float-gentle"></div>
      <div className="absolute top-1/4 right-16 w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-25 float-rotate"></div>
      <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-15 float-gentle"></div>
      
      {/* API Status Indicator */}
      {renderApiStatus()}
      
      <div className="container-jobhatch py-8 relative z-10">
        {/* Hide step indicator on welcome page */}
        {state.currentStep !== 'welcome' && renderStepIndicator()}
        
        {/* Current Step Content */}
        <div className="fade-in">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
} 