'use client'

import { useState } from 'react'
import JobDescriptionUploader from './JobDescriptionUploader'
import ResumeAnalyzer from './ResumeAnalyzer'
import { JobDescription, Resume } from '@/types'

export default function Dashboard() {
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [activeTab, setActiveTab] = useState('job-description')

  const tabs = [
    { id: 'job-description', label: 'Job Description', icon: '📝' },
    { id: 'resume-analysis', label: 'Resume Analysis', icon: '🎯' },
    { id: 'github', label: 'GitHub Analysis', icon: '🐙' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Resume Screening
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Streamline your hiring process with intelligent resume analysis. Upload job descriptions 
          and candidate resumes to get AI-powered insights, skill matching, and candidate rankings.
        </p>
      </div>

      {/* Quick Stats */}
      {(jobDescription || resumes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">📝</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Job Position</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {jobDescription ? '1' : '0'}
                </p>
                <p className="text-sm text-gray-600">
                  {jobDescription ? jobDescription.title : 'No job uploaded'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Candidates</p>
                <p className="text-2xl font-semibold text-gray-900">{resumes.length}</p>
                <p className="text-sm text-gray-600">
                  {resumes.length === 0 ? 'No resumes uploaded' : 
                   resumes.length === 1 ? '1 resume analyzed' : 
                   `${resumes.length} resumes analyzed`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">⭐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Top Match</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {resumes.length > 0 && resumes.some(r => r.analysis) 
                    ? `${Math.max(...resumes.filter(r => r.analysis).map(r => r.analysis!.overallScore))}%`
                    : '--'
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {resumes.length > 0 && resumes.some(r => r.analysis)
                    ? resumes
                        .filter(r => r.analysis)
                        .sort((a, b) => b.analysis!.overallScore - a.analysis!.overallScore)[0]
                        ?.candidateName || 'Best candidate'
                    : 'No analysis yet'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.id === 'job-description' && jobDescription && (
                <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
              {tab.id === 'resume-analysis' && resumes.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                  {resumes.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto">
        {activeTab === 'job-description' && (
          <div className="card">
            <JobDescriptionUploader
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
            />
          </div>
        )}

        {activeTab === 'resume-analysis' && (
          <div className="card">
            <ResumeAnalyzer
              jobDescription={jobDescription}
              resumes={resumes}
              setResumes={setResumes}
            />
          </div>
        )}

        {activeTab === 'github' && (
          <div className="card">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🐙</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">GitHub Integration</h3>
              <p className="text-gray-600 mb-6">
                Connect with GitHub to analyze candidates' coding skills and open source contributions.
              </p>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                Connect GitHub
              </button>
            </div>
            
            {resumes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  GitHub Analysis for Candidates
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  For developer positions, GitHub analysis helps evaluate technical skills, 
                  code quality, and open source contributions.
                </p>
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div key={resume.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{resume.candidateName}</h4>
                          <p className="text-sm text-gray-600">{resume.filename}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {resume.analysis?.githubAnalysis ? (
                            <span className="text-green-600">✓ GitHub profile analyzed</span>
                          ) : (
                            <span className="text-gray-400">No GitHub profile found</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Getting Started Guide */}
      {!jobDescription && resumes.length === 0 && (
        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">
              🚀 Getting Started with AI Resume Screening
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-medium">Upload or Enter Job Description</p>
                  <p className="text-blue-700">Start by uploading a job description document or manually entering the position details.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-medium">Upload Candidate Resumes</p>
                  <p className="text-blue-700">Upload multiple candidate resumes for automatic AI analysis and skill matching.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-medium">Review AI Analysis</p>
                  <p className="text-blue-700">Get detailed insights including match percentages, strengths, weaknesses, and candidate rankings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 