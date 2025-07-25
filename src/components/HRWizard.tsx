'use client'

import { useState, useEffect } from 'react'
import WelcomeStep from './steps/WelcomeStep'
import JobDescriptionStep from './steps/JobDescriptionStep'
import ConfirmJobDetails from './steps/ConfirmJobDetails'
import ResumeUploadStep from './steps/ResumeUploadStep'
import AnalysisProgressStep from './steps/AnalysisProgressStep'
import ResultsStep from './steps/ResultsStep'
import { JobDescription, Resume } from '@/types'

export type WizardStep = 'welcome' | 'job-description' | 'confirm-details' | 'resume-upload' | 'analysis' | 'results'

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
}

export default function HRWizard() {
  const [state, setState] = useState<HRWizardState>({
    currentStep: 'welcome',
    jobDescription: null,
    resumes: [],
    analysisProgress: 0,
    analysisSteps: [],
    apiStatus: 'unknown',
    apiMessage: undefined
  })

  // Test OpenAI API connection on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await fetch('/api/test-openai')
        const data = await response.json()
        
        if (data.success) {
          updateState({ 
            apiStatus: 'working',
            apiMessage: 'AI services ready'
          })
        } else {
          updateState({ 
            apiStatus: data.apiStatus || 'error',
            apiMessage: data.error || 'API test failed'
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
      <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border text-sm font-medium ${config.color}`}>
        <span className="mr-2">{config.icon}</span>
        {config.text}
        {state.apiMessage && (
          <div className="text-xs mt-1 opacity-80">{state.apiMessage}</div>
        )}
      </div>
    )
  }

  const renderStepIndicator = () => {
    const currentIndex = getCurrentStepIndex()
    
    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          const isPending = index > currentIndex
          const canNavigate = canNavigateToStep(index)
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => canNavigate ? goToStep(step.id) : null}
                  disabled={!canNavigate}
                  className={`step-indicator ${
                    isCompleted ? 'step-completed' :
                    isActive ? 'step-active' : 'step-pending'
                  } ${canNavigate ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-not-allowed opacity-50'}`}
                  title={canNavigate ? `Go to ${step.title}` : `Complete previous steps to unlock ${step.title}`}
                >
                  {isCompleted ? '✓' : index + 1}
                </button>
                <div className={`text-xs mt-1 hidden sm:block ${
                  canNavigate ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>
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

    switch (state.currentStep) {
      case 'welcome':
        return <WelcomeStep {...stepProps} />
      case 'job-description':
        return <JobDescriptionStep {...stepProps} />
      case 'confirm-details':
        return <ConfirmJobDetails {...stepProps} />
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
    <div className="jobhatch-bg min-h-screen">
      {/* API Status Indicator */}
      {renderApiStatus()}
      
      <div className="container-jobhatch py-8">
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