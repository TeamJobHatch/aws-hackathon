'use client'

import { useEffect, useState } from 'react'
import { Search, Globe, Github, Linkedin, FileText, CheckCircle, Clock } from 'lucide-react'

interface AnalysisProgressStepProps {
  state: any
  updateState: (updates: any) => void
  goToNextStep: () => void
}

interface AnalysisStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed'
  details?: string
  progress?: number
}

export default function AnalysisProgressStep({ 
  state, 
  updateState, 
  goToNextStep 
}: AnalysisProgressStepProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)

  const analysisSteps: AnalysisStep[] = [
    {
      id: 'parsing',
      title: 'Parsing Resumes',
      description: 'Extracting text and structure from uploaded documents',
      icon: <FileText className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'matching',
      title: 'Skill Matching',
      description: 'Analyzing technical skills and experience alignment',
      icon: <Search className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Research',
      description: 'Searching for candidate profiles and professional history',
      icon: <Linkedin className="h-5 w-5 text-blue-600" />,
      status: 'pending'
    },
    {
      id: 'github',
      title: 'GitHub Analysis',
      description: 'Evaluating code repositories and contribution patterns',
      icon: <Github className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'web-research',
      title: 'Web Research',
      description: 'Finding portfolios, personal websites, and additional information',
      icon: <Globe className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'scoring',
      title: 'Generating Scores',
      description: 'Calculating match percentages and rankings',
      icon: <CheckCircle className="h-5 w-5" />,
      status: 'pending'
    }
  ]

  const [steps, setSteps] = useState(analysisSteps)

  useEffect(() => {
    if (state.resumes.length === 0) return

    // Simulate real-time analysis progress
    const totalSteps = analysisSteps.length
    const stepDuration = 3000 // 3 seconds per step
    let currentStep = 0

    const timer = setInterval(() => {
      if (currentStep < totalSteps) {
        setSteps(prevSteps => 
          prevSteps.map((step, index) => ({
            ...step,
            status: index < currentStep ? 'completed' : 
                   index === currentStep ? 'active' : 'pending',
            details: index === currentStep ? getStepDetails(step.id, state.resumes) : step.details
          }))
        )

        const progress = ((currentStep + 1) / totalSteps) * 100
        setOverallProgress(progress)
        setCurrentStepIndex(currentStep)

        if (currentStep === totalSteps - 1) {
          // Complete analysis after last step
          setTimeout(() => {
            setSteps(prevSteps => 
              prevSteps.map(step => ({ ...step, status: 'completed' as const }))
            )
            setOverallProgress(100)
            
            // Move to results after a brief delay
            setTimeout(() => {
              goToNextStep()
            }, 1500)
          }, stepDuration / 2)
        }

        currentStep++
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [state.resumes.length, goToNextStep])

  const getStepDetails = (stepId: string, resumes: any[]) => {
    const candidateCount = resumes.length
    
    switch (stepId) {
      case 'parsing':
        return `Processing ${candidateCount} resume${candidateCount !== 1 ? 's' : ''}...`
      case 'matching':
        return `Analyzing skills against ${state.jobDescription?.requirements?.length || 0} job requirements...`
      case 'linkedin':
        return `Searching LinkedIn for ${candidateCount} candidate${candidateCount !== 1 ? 's' : ''}...`
      case 'github':
        return `Looking for GitHub profiles and repositories...`
      case 'web-research':
        return `Scanning the web for portfolios and additional information...`
      case 'scoring':
        return `Calculating final scores and rankings...`
      default:
        return 'Processing...'
    }
  }

  return (
    <div className="container-jobhatch-narrow">
      <div className="text-center mb-8">
        <h2 className="heading-lg">AI Analysis in Progress</h2>
        <p className="text-gray-600">
          JobHatch Enterprise is analyzing {state.resumes.length} candidate{state.resumes.length !== 1 ? 's' : ''} across multiple platforms
        </p>
      </div>

      {/* Overall Progress */}
      <div className="jobhatch-card mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-900">Overall Progress</span>
          <span className="text-2xl font-bold text-jobhatch-orange">{Math.round(overallProgress)}%</span>
        </div>
        
        <div className="progress-bar mb-4">
          <div 
            className="progress-fill" 
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>

        <div className="text-sm text-gray-600">
          {overallProgress === 100 ? 
            'Analysis complete! Preparing results...' : 
            `Step ${currentStepIndex + 1} of ${steps.length}: ${steps[currentStepIndex]?.title}`
          }
        </div>
      </div>

      {/* Analysis Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`analysis-step ${
              step.status === 'active' ? 'analysis-step-active' :
              step.status === 'completed' ? 'analysis-step-completed' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Step Icon */}
              <div className={`p-2 rounded-full ${
                step.status === 'completed' ? 'bg-green-100' :
                step.status === 'active' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : step.status === 'active' ? (
                  <div className="jobhatch-spinner"></div>
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {step.icon}
                  <h3 className={`font-semibold ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'active' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                
                {step.details && (
                  <p className="text-xs text-gray-500 italic">
                    {step.details}
                  </p>
                )}

                {step.status === 'active' && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="text-right">
                {step.status === 'completed' && (
                  <span className="text-xs text-green-600 font-medium">✓ Complete</span>
                )}
                {step.status === 'active' && (
                  <span className="text-xs text-blue-600 font-medium">In Progress</span>
                )}
                {step.status === 'pending' && (
                  <span className="text-xs text-gray-400">Pending</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="mt-8 jobhatch-card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="text-purple-600 mr-2">🧠</span>
          AI Analysis Insights
        </h3>
        
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Analyzing {state.resumes.length} candidates against {state.jobDescription?.requirements?.length || 0} job requirements</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Cross-referencing skills with industry standards and job market trends</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Evaluating experience relevance and career progression patterns</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Assessing technical proficiency through GitHub contributions and project quality</span>
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          This process typically takes 2-5 minutes depending on the number of candidates
        </p>
      </div>
    </div>
  )
} 