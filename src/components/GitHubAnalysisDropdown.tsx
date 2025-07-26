'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Github, ExternalLink, Star, GitFork, Calendar, Code, Users, Activity } from 'lucide-react'

interface GitHubAnalysisDropdownProps {
  analysis: any // GitHub analysis object
  candidateName: string
}

export default function GitHubAnalysisDropdown({ analysis, candidateName }: GitHubAnalysisDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const overallHiringImpact = () => {
    const techScore = analysis.technicalScore || 0
    const activityScore = analysis.activityScore || 0
    const avgScore = (techScore + activityScore) / 2

    if (avgScore >= 85) {
      return { verdict: 'Strong Technical Profile', color: 'text-green-700 bg-green-100', icon: '🚀' }
    } else if (avgScore >= 70) {
      return { verdict: 'Good Technical Skills', color: 'text-green-600 bg-green-50', icon: '👍' }
    } else if (avgScore >= 50) {
      return { verdict: 'Moderate Activity', color: 'text-yellow-600 bg-yellow-50', icon: '⚠️' }
    } else {
      return { verdict: 'Limited Activity', color: 'text-red-600 bg-red-50', icon: '📈' }
    }
  }

  const hiringImpact = overallHiringImpact()

  if (!analysis) {
    return (
      <div className="border border-gray-200 rounded-xl bg-gray-50 p-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <Github className="h-5 w-5" />
          <span>No GitHub analysis available</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Github className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-gray-900">GitHub Analysis</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.technicalScore || 0)}`}>
            {analysis.technicalScore || 0}% Technical
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${hiringImpact.color}`}>
            {hiringImpact.icon} {hiringImpact.verdict}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {analysis.profile?.html_url && (
            <a
              href={analysis.profile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </motion.button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.technicalScore || 0).split(' ')[0]}`}>
                    {analysis.technicalScore || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Technical Score</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.activityScore || 0).split(' ')[0]}`}>
                    {analysis.activityScore || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Activity Score</div>
                </div>
              </div>

              {/* Profile Stats */}
              {analysis.profile && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Profile Overview
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{analysis.profile.public_repos || 0} Repos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{analysis.profile.followers || 0} Followers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GitFork className="h-4 w-4 text-green-500" />
                      <span>{analysis.profile.following || 0} Following</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>Since {new Date(analysis.profile.created_at).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Relevant Repositories */}
              {analysis.relevantRepositories && analysis.relevantRepositories.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    Relevant Projects
                  </h4>
                  <div className="space-y-3">
                    {analysis.relevantRepositories.slice(0, 3).map((repo: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{repo.name}</h5>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>{repo.stargazers_count || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <GitFork className="h-3 w-3" />
                              <span>{repo.forks_count || 0}</span>
                            </div>
                          </div>
                        </div>
                        {repo.description && (
                          <p className="text-sm text-gray-600 mb-2">{repo.description}</p>
                        )}
                        {repo.language && (
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {repo.language}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Quality Indicators */}
              {analysis.codeQualityIndicators && analysis.codeQualityIndicators.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Code Quality Indicators
                  </h4>
                  <ul className="space-y-2">
                    {analysis.codeQualityIndicators.map((indicator: string, index: number) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="text-green-500 mr-2 mt-0.5">•</span>
                        <span className="text-gray-700">{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Evidence */}
              {analysis.skillsEvidence && analysis.skillsEvidence.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Skills Evidence</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillsEvidence.map((skill: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hiring Recommendation */}
              <div className={`p-4 rounded-lg border-l-4 ${hiringImpact.color.includes('green') ? 'border-l-green-500 bg-green-50' : hiringImpact.color.includes('yellow') ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-purple-500 bg-purple-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{hiringImpact.icon}</span>
                  <h4 className="font-semibold">Technical Assessment: {hiringImpact.verdict}</h4>
                </div>
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 