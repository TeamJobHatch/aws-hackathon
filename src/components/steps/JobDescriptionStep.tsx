'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Link as LinkIcon, FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'
import { JobDescription } from '@/types'

interface JobDescriptionStepProps {
  state: any
  updateState: (updates: any) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
}

export default function JobDescriptionStep({ 
  state, 
  updateState, 
  goToNextStep, 
  goToPreviousStep 
}: JobDescriptionStepProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'manual'>('upload')
  const [jobLink, setJobLink] = useState('')
  const [manualData, setManualData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: ''
  })

  const uploadMutation = useMutation(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'job-description')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Upload failed')
      return response.json()
    },
    {
      onSuccess: (data) => {
        const newJobDescription: JobDescription = {
          id: data.id,
          title: data.extractedData?.title || 'Job Position',
          company: data.extractedData?.company || '',
          description: data.content,
          requirements: data.extractedData?.requirements || [],
          qualifications: data.extractedData?.qualifications || [],
          skills: data.extractedData?.skills || [],
          experience: data.extractedData?.experience || '',
          location: data.extractedData?.location || '',
          salary: data.extractedData?.salary || '',
          uploadedAt: new Date(),
          content: data.content
        }
        
        // Update API status based on response
        const apiStatus = data.apiStatus || 'working'
        const apiMessage = data.apiMessage
        
        updateState({ 
          jobDescription: newJobDescription,
          apiStatus,
          apiMessage
        })
        
        if (apiStatus === 'working') {
          toast.success('Job description uploaded successfully!')
        } else if (apiStatus === 'limited') {
          toast.success('Job description uploaded! AI analysis limited - using basic extraction.')
        } else {
          toast.success('Job description uploaded! Using basic analysis due to AI service issues.')
        }
        
        goToNextStep()
      },
      onError: (error: any) => {
        const errorData = error.response?.data
        if (errorData?.apiStatus) {
          updateState({ 
            apiStatus: errorData.apiStatus,
            apiMessage: errorData.apiMessage
          })
        }
        toast.error('Failed to upload job description. Please try again.')
      }
    }
  )

  const linkMutation = useMutation(
    async (url: string) => {
      // This would be an API call to fetch job details from a URL
      const response = await fetch('/api/fetch-job-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      
      if (!response.ok) throw new Error('Failed to fetch job details')
      return response.json()
    },
    {
      onSuccess: (data) => {
        const newJobDescription: JobDescription = {
          id: Date.now().toString(),
          title: data.title || 'Job Position',
          company: data.company || '',
          description: data.description || '',
          requirements: data.requirements || [],
          qualifications: data.qualifications || [],
          skills: data.skills || [],
          experience: data.experience || '',
          location: data.location || '',
          salary: data.salary || '',
          uploadedAt: new Date(),
          content: data.content || data.description
        }
        updateState({ jobDescription: newJobDescription })
        toast.success('Job details fetched successfully!')
        goToNextStep()
      },
      onError: () => {
        toast.error('Failed to fetch job details. Please try manual entry.')
        setActiveTab('manual')
      }
    }
  )

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadMutation.mutate(acceptedFiles[0])
    }
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  })

  const handleLinkSubmit = () => {
    if (!jobLink.trim()) {
      toast.error('Please enter a valid job posting URL')
      return
    }
    linkMutation.mutate(jobLink)
  }

  const handleManualSubmit = () => {
    if (!manualData.title || !manualData.company || !manualData.description) {
      toast.error('Please fill in the required fields')
      return
    }

    const requirements = manualData.requirements.split('\n').filter(req => req.trim())
    
    const newJobDescription: JobDescription = {
      id: Date.now().toString(),
      title: manualData.title,
      company: manualData.company,
      description: manualData.description,
      requirements,
      qualifications: [],
      skills: [],
      experience: '',
      location: manualData.location,
      salary: '',
      uploadedAt: new Date(),
      content: `${manualData.title}\n\n${manualData.company}\n\n${manualData.description}\n\nRequirements:\n${manualData.requirements}`
    }
    
    updateState({ jobDescription: newJobDescription })
    toast.success('Job description created successfully!')
    goToNextStep()
  }

  return (
    <div className="container-jobhatch-narrow">
      <div className="text-center mb-8">
        <h2 className="heading-lg">Job Description</h2>
        <p className="text-gray-600">
          Upload a job posting, enter a link, or create it manually
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'link'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            Job Link
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'manual'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      <div className="jobhatch-card">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`upload-area-jobhatch ${isDragActive ? 'upload-area-active' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop the job description here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    Drag & drop your job description, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                </div>
              )}
            </div>
            
            {uploadMutation.isLoading && (
              <div className="flex items-center justify-center p-4">
                <div className="jobhatch-spinner mr-3"></div>
                <span className="text-gray-600">Processing job description...</span>
              </div>
            )}
          </div>
        )}

        {/* Link Tab */}
        {activeTab === 'link' && (
          <div className="space-y-6">
            <div>
              <label className="form-label-jobhatch">Job Posting URL</label>
              <input
                type="url"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://company.com/careers/job-posting"
                className="form-input-jobhatch"
              />
              <p className="text-sm text-gray-500 mt-2">
                Our AI will fetch and analyze the job details from the link
              </p>
            </div>

            <button
              onClick={handleLinkSubmit}
              disabled={linkMutation.isLoading || !jobLink.trim()}
              className="btn-jobhatch-primary w-full"
            >
              {linkMutation.isLoading ? (
                <>
                  <div className="jobhatch-spinner mr-2"></div>
                  Fetching Job Details...
                </>
              ) : (
                <>
                  Fetch Job Details
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label-jobhatch">Job Title *</label>
                <input
                  type="text"
                  value={manualData.title}
                  onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                  placeholder="e.g., Senior Frontend Developer"
                  className="form-input-jobhatch"
                />
              </div>
              <div>
                <label className="form-label-jobhatch">Company *</label>
                <input
                  type="text"
                  value={manualData.company}
                  onChange={(e) => setManualData({ ...manualData, company: e.target.value })}
                  placeholder="e.g., Tech Corp Inc."
                  className="form-input-jobhatch"
                />
              </div>
            </div>

            <div>
              <label className="form-label-jobhatch">Location</label>
              <input
                type="text"
                value={manualData.location}
                onChange={(e) => setManualData({ ...manualData, location: e.target.value })}
                placeholder="e.g., New York, NY (Remote)"
                className="form-input-jobhatch"
              />
            </div>

            <div>
              <label className="form-label-jobhatch">Job Description *</label>
              <textarea
                value={manualData.description}
                onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="form-textarea-jobhatch"
                rows={4}
              />
            </div>

            <div>
              <label className="form-label-jobhatch">Requirements (one per line)</label>
              <textarea
                value={manualData.requirements}
                onChange={(e) => setManualData({ ...manualData, requirements: e.target.value })}
                placeholder="5+ years of React experience&#10;Strong TypeScript skills&#10;Experience with REST APIs"
                className="form-textarea-jobhatch"
                rows={4}
              />
            </div>

            <button
              onClick={handleManualSubmit}
              className="btn-jobhatch-primary w-full"
            >
              Continue with Job Description
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={goToPreviousStep}
          className="btn-jobhatch-secondary"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>
      </div>
    </div>
  )
} 