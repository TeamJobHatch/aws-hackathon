'use client'

import { useState } from 'react'
import ChatInterface from './ChatInterface'
import FileUploader from './FileUploader'
import GitHubIntegration from './GitHubIntegration'
import LinkedInIntegration from './LinkedInIntegration'
import PortfolioManager from './PortfolioManager'
import { UploadedFile } from '@/types'

export default function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [activeTab, setActiveTab] = useState('chat')

  const tabs = [
    { id: 'chat', label: 'AI Assistant', icon: '🤖' },
    { id: 'files', label: 'Documents', icon: '📄' },
    { id: 'github', label: 'GitHub', icon: '🐙' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { id: 'portfolio', label: 'Portfolio', icon: '🎨' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Job Application Assistant
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Connect your GitHub, LinkedIn, and portfolio to get personalized job application assistance 
          powered by ChatGPT. Upload your resume and let AI help you land your dream job.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'chat' && (
          <div className="card">
            <ChatInterface uploadedFiles={uploadedFiles} />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="card">
            <FileUploader 
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
            />
          </div>
        )}

        {activeTab === 'github' && (
          <div className="card">
            <GitHubIntegration />
          </div>
        )}

        {activeTab === 'linkedin' && (
          <div className="card">
            <LinkedInIntegration />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="card">
            <PortfolioManager />
          </div>
        )}
      </div>
    </div>
  )
} 