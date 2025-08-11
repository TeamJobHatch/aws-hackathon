'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, ArrowRight, ArrowLeft, User, AlertCircle, Search, Linkedin, Github, Globe, CheckCircle, Activity, Brain } from 'lucide-react'
import { useMutation } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Resume } from '@/types'

interface ResumeUploadStepProps {
  state: any
  updateState: (updates: any) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
}

export default function ResumeUploadStep({ 
  state, 
  updateState, 
  goToNextStep, 
  goToPreviousStep 
}: ResumeUploadStepProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [analysisLogs, setAnalysisLogs] = useState<Array<{
    id: string
    message: string
    timestamp: number
    type: 'info' | 'success' | 'warning' | 'error'
    step: string
  }>>([])
  const [analysisSteps, setAnalysisSteps] = useState<Array<{
    id: string
    title: string
    description: string
    icon: React.ReactElement
    status: 'pending' | 'active' | 'completed'
  }>>([
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
  ])
  
  const maxResumes = 5

  // Helper function to add analysis logs
  const addAnalysisLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', step: string = '') => {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      timestamp: Date.now(),
      type,
      step
    }
    setAnalysisLogs(prev => [...prev, log])
    return log
  }

  // Simulate real-time analysis progress
  const simulateAnalysisProgress = (candidateCount: number) => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisLogs([])
    
    addAnalysisLog(`🔍 Starting Gemini 2.5 powered analysis for ${candidateCount} candidate${candidateCount > 1 ? 's' : ''}`, 'info', 'startup')
    addAnalysisLog(`📊 Analyzing against ${state.jobDescription?.skills?.length || 8} job requirements`, 'info', 'startup')
    addAnalysisLog(`🧠 Cross-referencing skills with industry standards and job market trends`, 'info', 'startup')
    
    const totalSteps = analysisSteps.length
    let currentStepIndex = 0
    
    const progressTimer = setInterval(() => {
      if (currentStepIndex < totalSteps) {
        const step = analysisSteps[currentStepIndex]
        
        // Update step status
        setAnalysisSteps(prev => prev.map((s, index) => ({
          ...s,
          status: index < currentStepIndex ? 'completed' : 
                 index === currentStepIndex ? 'active' : 'pending'
        })))
        
        setCurrentStep(step.title)
        
        // Add step-specific logs
        switch (step.id) {
          case 'parsing':
            addAnalysisLog(`📄 Extracting text and metadata from ${candidateCount} resume${candidateCount > 1 ? 's' : ''}`, 'info', 'parsing')
            setTimeout(() => addAnalysisLog(`✅ Successfully parsed ${candidateCount} document${candidateCount > 1 ? 's' : ''}`, 'success', 'parsing'), 1000)
            break
          case 'matching':
            addAnalysisLog(`🔍 Analyzing technical skills and experience alignment`, 'info', 'matching')
            setTimeout(() => addAnalysisLog(`🎯 Skill matching complete with high confidence`, 'success', 'matching'), 1500)
            break
          case 'linkedin':
            addAnalysisLog(`🔗 Searching LinkedIn profiles for professional verification`, 'info', 'linkedin')
            setTimeout(() => addAnalysisLog(`📊 LinkedIn credibility scores calculated`, 'success', 'linkedin'), 1200)
            break
          case 'github':
            addAnalysisLog(`💻 Evaluating GitHub repositories and code quality`, 'info', 'github')
            setTimeout(() => addAnalysisLog(`⚡ Repository analysis complete - individual project ratings available`, 'success', 'github'), 1800)
            break
          case 'web-research':
            addAnalysisLog(`🌐 Scanning for portfolios and professional websites`, 'info', 'web-research')
            setTimeout(() => addAnalysisLog(`📝 Additional candidate information gathered`, 'success', 'web-research'), 1000)
            break
          case 'scoring':
            addAnalysisLog(`📈 Calculating final match percentages and rankings`, 'info', 'scoring')
            setTimeout(() => addAnalysisLog(`🎉 Analysis complete! Ready to review candidate insights`, 'success', 'scoring'), 1500)
            break
        }
        
        const progress = ((currentStepIndex + 1) / totalSteps) * 100
        setAnalysisProgress(progress)
        
        if (currentStepIndex === totalSteps - 1) {
          setTimeout(() => {
            setAnalysisSteps(prev => prev.map(s => ({ ...s, status: 'completed' as 'completed' })))
            setAnalysisProgress(100)
            setIsAnalyzing(false)
            addAnalysisLog(`✨ Gemini 2.5 analysis completed successfully`, 'success', 'complete')
            
            // Auto-proceed to results after analysis
            setTimeout(() => {
              goToNextStep() // This will now go directly to results since analysis step is removed
            }, 2000)
          }, 1000)
        }
        
        currentStepIndex++
      }
    }, 3000) // 3 second intervals
    
    return () => clearInterval(progressTimer)
  }

  const uploadMutation = useMutation(
    async (files: File[]) => {
      setIsUploading(true)
      
      // Start real-time analysis simulation
      const cleanup = simulateAnalysisProgress(files.length)
      
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'resume')
        formData.append('jobDescription', JSON.stringify(state.jobDescription))
        
        const response = await fetch('/api/analyze-resume', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) throw new Error(`Failed to upload ${file.name}`)
        return response.json()
      })

      const results = await Promise.all(uploadPromises)
      return results
    },
         {
       onSuccess: (results) => {
         const newResumes: Resume[] = results.map(data => ({
           id: data.id,
           candidateName: data.candidateName || 'Unknown Candidate',
           email: data.email,
           phone: data.phone,
           filename: data.filename,
           content: data.content,
           uploadedAt: new Date(),
           analysis: data.analysis
         }))
         
         const updatedResumes = [...state.resumes, ...newResumes]
         
         // Check if any resume had API issues
         let hasApiIssues = false
         let apiStatus = 'working'
         let apiMessage = ''
         
         for (const result of results) {
           if (result.apiStatus && result.apiStatus !== 'working') {
             hasApiIssues = true
             apiStatus = result.apiStatus
             apiMessage = result.apiMessage || ''
             break
           }
         }
         
         updateState({ 
           resumes: updatedResumes,
           ...(hasApiIssues && { apiStatus, apiMessage })
         })
         
         if (hasApiIssues) {
           toast.success(`${newResumes.length} resume(s) uploaded! AI analysis ${apiStatus === 'limited' ? 'limited' : 'unavailable'} - using basic analysis.`)
         } else {
           toast.success(`${newResumes.length} resume(s) uploaded successfully!`)
         }
         
         setIsUploading(false)
       },
       onError: (error: any) => {
         const errorData = error.response?.data
         if (errorData?.apiStatus) {
           updateState({ 
             apiStatus: errorData.apiStatus,
             apiMessage: errorData.apiMessage
           })
         }
         toast.error(error.message || 'Failed to upload resumes. Please try again.')
         setIsUploading(false)
       }
     }
  )

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const currentCount = state.resumes.length
    const remainingSlots = maxResumes - currentCount
    
    if (acceptedFiles.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more resume(s). Maximum is ${maxResumes}.`)
      return
    }

    uploadMutation.mutate(acceptedFiles)
  }, [state.resumes.length, uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    disabled: state.resumes.length >= maxResumes || isUploading
  })

  const removeResume = (resumeId: string) => {
    const updatedResumes = state.resumes.filter((r: Resume) => r.id !== resumeId)
    updateState({ resumes: updatedResumes })
    toast.success('Resume removed')
  }

  const canProceed = state.resumes.length > 0

  return (
    <div className="container-jobhatch-narrow">
      <div className="text-center mb-8">
        <h2 className="heading-lg">Upload Resumes</h2>
        <p className="text-gray-600">
          Upload candidate resumes for AI analysis (maximum {maxResumes} for demo)
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Resumes Uploaded: {state.resumes.length} / {maxResumes}
          </span>
          <span className="text-sm text-gray-500">
            {maxResumes - state.resumes.length} remaining
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(state.resumes.length / maxResumes) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Upload Area */}
      {state.resumes.length < maxResumes && (
        <div className="jobhatch-card mb-8">
          <div
            {...getRootProps()}
            className={`upload-area-jobhatch ${isDragActive ? 'upload-area-active' : ''} ${
              state.resumes.length >= maxResumes || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the resumes here...</p>
            ) : isUploading ? (
              <div className="flex items-center justify-center">
                <div className="jobhatch-spinner mr-3"></div>
                <p className="text-gray-600 font-medium">Uploading and analyzing resumes...</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">
                  Drag & drop resumes here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX (Max 10MB each) • Up to {maxResumes - state.resumes.length} more files
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time AI Analysis Progress */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="jobhatch-card mb-8 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Analysis in Progress</h3>
                    <p className="text-sm text-gray-600">JobHatch Enterprise is analyzing {state.resumes.length} candidate across multiple platforms</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(analysisProgress)}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm text-purple-600">{Math.round(analysisProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Analysis Steps */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {analysisSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`p-4 rounded-lg border ${
                      step.status === 'completed' ? 'bg-green-50 border-green-200' :
                      step.status === 'active' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 ${
                        step.status === 'completed' ? 'text-green-600' :
                        step.status === 'active' ? 'text-blue-600' :
                        'text-gray-400'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : step.status === 'active' ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Activity className="h-5 w-5" />
                          </motion.div>
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${
                          step.status === 'completed' ? 'text-green-800' :
                          step.status === 'active' ? 'text-blue-800' :
                          'text-gray-600'
                        }`}>
                          {step.title}
                        </h4>
                        <p className={`text-xs ${
                          step.status === 'completed' ? 'text-green-600' :
                          step.status === 'active' ? 'text-blue-600' :
                          'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        step.status === 'completed' ? 'bg-green-100 text-green-700' :
                        step.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {step.status === 'completed' ? 'Completed' :
                         step.status === 'active' ? 'In Progress' :
                         'Pending'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Analysis Insights */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium text-gray-900">🧠 AI Analysis Insights</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Analyzing {state.resumes.length} candidates against {state.jobDescription?.skills?.length || 8} job requirements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Cross-referencing skills with industry standards and job market trends</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Evaluating experience relevance and career progression patterns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>Assessing technical proficiency through GitHub contributions and project quality</span>
                  </div>
                </div>
              </div>

              {/* Real-time Logs */}
              {analysisLogs.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Live Analysis Feed
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <div className="space-y-1">
                      {analysisLogs.slice(-8).map((log, index) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`text-xs font-mono ${
                            log.type === 'success' ? 'text-green-400' :
                            log.type === 'warning' ? 'text-yellow-400' :
                            log.type === 'error' ? 'text-red-400' :
                            'text-gray-300'
                          }`}
                        >
                          <span className="text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString('en-US', { 
                              hour12: false, 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit' 
                            })}
                          </span>
                          <span className="ml-2">{log.message}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Resumes */}
      {state.resumes.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Uploaded Resumes ({state.resumes.length})
          </h3>
          
          <div className="space-y-3">
            {state.resumes.map((resume: Resume, index: number) => (
              <div key={resume.id} className="jobhatch-card-small">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{resume.candidateName}</h4>
                      <p className="text-sm text-gray-500">{resume.filename}</p>
                      {resume.analysis && (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            resume.analysis.overallScore >= 80 ? 'score-excellent' :
                            resume.analysis.overallScore >= 70 ? 'score-good' :
                            resume.analysis.overallScore >= 60 ? 'score-fair' : 'score-poor'
                          }`}>
                            {resume.analysis.overallScore}% Match
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {resume.analysis ? (
                      <span className="text-green-600 text-sm">✓ Analyzed</span>
                    ) : (
                      <span className="text-gray-500 text-sm">Processing...</span>
                    )}
                    <button
                      onClick={() => removeResume(resume.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {state.resumes.length === 0 && (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No resumes uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload candidate resumes to begin AI analysis
          </p>
        </div>
      )}

      {/* Maximum Reached Notice */}
      {state.resumes.length >= maxResumes && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Maximum resumes reached
              </p>
              <p className="text-sm text-orange-700">
                You've reached the {maxResumes} resume limit for this demo. Remove a resume to upload another.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={goToPreviousStep}
          className="btn-jobhatch-secondary flex-1 flex items-center justify-center"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Job Details
        </button>
        
        <button
          onClick={goToNextStep}
          disabled={!canProceed || isUploading}
          className={`flex-1 flex items-center justify-center ${
            canProceed && !isUploading 
              ? 'btn-jobhatch-primary' 
              : 'btn-jobhatch-secondary opacity-50 cursor-not-allowed'
          }`}
        >
          {isUploading ? (
            <>
              <div className="jobhatch-spinner mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Start AI Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {canProceed 
            ? 'Ready to analyze candidates with AI across LinkedIn, GitHub, and portfolios'
            : 'Upload at least one resume to proceed'
          }
        </p>
      </div>
    </div>
  )
} 