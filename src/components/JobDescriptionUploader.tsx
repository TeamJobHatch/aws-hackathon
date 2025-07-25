'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Plus, Building, MapPin, DollarSign } from 'lucide-react'
import { JobDescription } from '@/types'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'

interface JobDescriptionUploaderProps {
  jobDescription: JobDescription | null
  setJobDescription: (job: JobDescription | null) => void
}

export default function JobDescriptionUploader({ 
  jobDescription, 
  setJobDescription 
}: JobDescriptionUploaderProps) {
  const [isManualEntry, setIsManualEntry] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    requirements: '',
    qualifications: ''
  })

  const uploadMutation = useMutation(
    async (file: File) => {
      const formDataToSend = new FormData()
      formDataToSend.append('file', file)
      formDataToSend.append('type', 'job-description')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      })
      
      if (!response.ok) throw new Error('Upload failed')
      return response.json()
    },
    {
      onSuccess: (data) => {
        const newJobDescription: JobDescription = {
          id: data.id,
          title: data.extractedData?.title || 'Uploaded Job Description',
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
        setJobDescription(newJobDescription)
        toast.success('Job description uploaded and parsed successfully!')
      },
      onError: () => {
        toast.error('Failed to upload job description. Please try again.')
      }
    }
  )

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate(file)
    })
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const handleManualSubmit = () => {
    const requirements = formData.requirements.split('\n').filter(req => req.trim())
    const qualifications = formData.qualifications.split('\n').filter(qual => qual.trim())
    
    const newJobDescription: JobDescription = {
      id: Date.now().toString(),
      title: formData.title,
      company: formData.company,
      description: formData.description,
      requirements,
      qualifications,
      skills: [], // Could be extracted from description
      experience: '', // Could be extracted from description
      location: formData.location,
      salary: formData.salary,
      uploadedAt: new Date(),
      content: `${formData.title}\n\n${formData.company}\n\n${formData.description}\n\nRequirements:\n${formData.requirements}\n\nQualifications:\n${formData.qualifications}`
    }
    
    setJobDescription(newJobDescription)
    setIsManualEntry(false)
    toast.success('Job description created successfully!')
  }

  const clearJobDescription = () => {
    setJobDescription(null)
    setFormData({
      title: '',
      company: '',
      location: '',
      salary: '',
      description: '',
      requirements: '',
      qualifications: ''
    })
    toast.success('Job description cleared')
  }

  if (jobDescription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Current Job Position</h2>
          <button
            onClick={clearJobDescription}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Clear & Upload New
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{jobDescription.title}</h3>
              <div className="flex items-center space-x-4 text-gray-600 mt-2">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {jobDescription.company}
                </div>
                {jobDescription.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {jobDescription.location}
                  </div>
                )}
                {jobDescription.salary && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {jobDescription.salary}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 text-sm">{jobDescription.description.substring(0, 300)}...</p>
            </div>

            {jobDescription.requirements.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {jobDescription.requirements.slice(0, 3).map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {req}
                    </li>
                  ))}
                  {jobDescription.requirements.length > 3 && (
                    <li className="text-gray-500 text-xs">... and {jobDescription.requirements.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Uploaded on {jobDescription.uploadedAt.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isManualEntry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Enter Job Description Manually</h2>
          <button
            onClick={() => setIsManualEntry(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Upload
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Tech Corp Inc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., New York, NY (Remote)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., $80,000 - $120,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the role, responsibilities, and what the ideal candidate should bring..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements (one per line)
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5+ years of React experience&#10;Strong TypeScript skills&#10;Experience with REST APIs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualifications (one per line)
            </label>
            <textarea
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bachelor's degree in Computer Science&#10;AWS certification preferred&#10;Experience in Agile environments"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsManualEntry(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={!formData.title || !formData.company || !formData.description}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Job Description
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Job Description</h2>
        <p className="text-gray-600">
          Upload a job description document or enter the details manually to start screening resumes
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop the job description here...</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium mb-2">
              Drag & drop job description file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX, TXT (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Manual Entry Option */}
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">OR</span>
          </div>
        </div>
        
        <button
          onClick={() => setIsManualEntry(true)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Enter Job Details Manually
        </button>
      </div>

      {/* Loading State */}
      {uploadMutation.isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="spinner mr-2"></div>
          <span className="text-gray-600">Uploading and parsing job description...</span>
        </div>
      )}
    </div>
  )
} 