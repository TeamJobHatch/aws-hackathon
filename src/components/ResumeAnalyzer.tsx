'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Eye, TrendingUp, User, ChevronDown, ChevronUp, Star, GitBranch } from 'lucide-react'
import { Resume, JobDescription, ResumeAnalysis } from '@/types'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'

interface ResumeAnalyzerProps {
  jobDescription: JobDescription | null
  resumes: Resume[]
  setResumes: (resumes: Resume[]) => void
}

export default function ResumeAnalyzer({ 
  jobDescription, 
  resumes, 
  setResumes 
}: ResumeAnalyzerProps) {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null)

  const uploadMutation = useMutation(
    async (file: File) => {
      if (!jobDescription) {
        throw new Error('Please upload a job description first')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'resume')
      formData.append('jobDescription', JSON.stringify(jobDescription))
      
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Analysis failed')
      return response.json()
    },
    {
      onSuccess: (data) => {
        const newResume: Resume = {
          id: data.id,
          candidateName: data.candidateName || 'Unknown Candidate',
          email: data.email,
          phone: data.phone,
          filename: data.filename,
          content: data.content,
          uploadedAt: new Date(),
          analysis: data.analysis
        }
        setResumes([...resumes, newResume])
        toast.success('Resume analyzed successfully!')
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to analyze resume. Please try again.')
      }
    }
  )

  const reanalyzeResume = useMutation(
    async (resumeId: string) => {
      if (!jobDescription) {
        throw new Error('Job description is required for analysis')
      }

      const response = await fetch('/api/reanalyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeId, 
          jobDescription 
        }),
      })
      
      if (!response.ok) throw new Error('Re-analysis failed')
      return response.json()
    },
    {
      onSuccess: (data) => {
        setResumes(resumes.map(resume => 
          resume.id === data.resumeId 
            ? { ...resume, analysis: data.analysis }
            : resume
        ))
        toast.success('Resume re-analyzed successfully!')
      },
      onError: () => {
        toast.error('Failed to re-analyze resume. Please try again.')
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
      'application/msword': ['.doc']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const removeResume = (resumeId: string) => {
    setResumes(resumes.filter(r => r.id !== resumeId))
    if (selectedResume?.id === resumeId) {
      setSelectedResume(null)
    }
    toast.success('Resume removed')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const sortedResumes = [...resumes].sort((a, b) => {
    const scoreA = a.analysis?.overallScore || 0
    const scoreB = b.analysis?.overallScore || 0
    return scoreB - scoreA
  })

  if (!jobDescription) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Job Description First</h3>
        <p className="text-gray-600">
          Please upload or create a job description before analyzing resumes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Analysis</h2>
        <p className="text-gray-600">
          Upload candidate resumes to analyze their fit for the {jobDescription.title} position
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
          <p className="text-blue-600 font-medium">Drop the resumes here...</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium mb-2">
              Drag & drop resumes here, or click to select multiple files
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX (Max 10MB each)
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {uploadMutation.isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="spinner mr-2"></div>
          <span className="text-gray-600">Analyzing resume with AI...</span>
        </div>
      )}

      {/* Resume List */}
      {sortedResumes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Candidate Analysis Results ({resumes.length} resume{resumes.length !== 1 ? 's' : ''})
            </h3>
            <div className="text-sm text-gray-500">
              Sorted by overall score (highest first)
            </div>
          </div>

          <div className="space-y-3">
            {sortedResumes.map((resume, index) => (
              <div
                key={resume.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-medium px-2 py-1 rounded ${
                        index === 0 ? 'text-yellow-700 bg-yellow-100' :
                        index === 1 ? 'text-gray-700 bg-gray-100' :
                        index === 2 ? 'text-amber-700 bg-amber-100' :
                        'text-gray-600 bg-gray-50'
                      }`}>
                        #{index + 1}
                      </div>
                      {index < 3 && (
                        <Star className={`h-4 w-4 ${
                          index === 0 ? 'text-yellow-500' : 'text-gray-400'
                        }`} />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <h4 className="font-medium text-gray-900">{resume.candidateName}</h4>
                      </div>
                      <p className="text-sm text-gray-500">{resume.filename}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {resume.analysis && (
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded text-sm font-medium ${
                          getScoreColor(resume.analysis.overallScore)
                        }`}>
                          {resume.analysis.overallScore}% Match
                        </div>
                        <div className={`px-2 py-1 rounded text-sm font-medium ${
                          getScoreColor(resume.analysis.matchPercentage)
                        }`}>
                          {resume.analysis.matchPercentage}% Skills
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedAnalysis(
                          expandedAnalysis === resume.id ? null : resume.id
                        )}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {expandedAnalysis === resume.id ? 'Hide' : 'Details'}
                        {expandedAnalysis === resume.id ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                        }
                      </button>
                      
                      <button
                        onClick={() => reanalyzeResume.mutate(resume.id)}
                        disabled={reanalyzeResume.isLoading}
                        className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => removeResume(resume.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Analysis */}
                {expandedAnalysis === resume.id && resume.analysis && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">Strengths</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {resume.analysis.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-red-600 mb-2">Areas of Concern</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {resume.analysis.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-red-500 mr-2">!</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">AI Summary</h5>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {resume.analysis.summary}
                      </p>
                    </div>

                    {resume.analysis.githubAnalysis && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                          <GitBranch className="h-4 w-4 mr-1" />
                          GitHub Analysis
                        </h5>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">@{resume.analysis.githubAnalysis.username}</span>
                            <div className="flex space-x-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                Technical: {resume.analysis.githubAnalysis.technicalScore}/100
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                Activity: {resume.analysis.githubAnalysis.activityScore}/100
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600">
                            {resume.analysis.githubAnalysis.relevantRepositories.length} relevant repositories found
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {resume.analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-500 mr-2">→</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {resumes.length === 0 && !uploadMutation.isLoading && (
        <div className="text-center py-8">
          <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-600">No resumes uploaded yet. Upload candidate resumes to start analysis.</p>
        </div>
      )}
    </div>
  )
} 