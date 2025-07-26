'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, ArrowRight, ArrowLeft, User, AlertCircle } from 'lucide-react'
import { useMutation } from 'react-query'
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
  const maxResumes = 5

  const uploadMutation = useMutation(
    async (files: File[]) => {
      setIsUploading(true)
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