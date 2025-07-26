'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle, ExternalLink, User, Building, Calendar, Award, Users, Eye } from 'lucide-react'

interface LinkedInAnalysis {
  profile_url: string
  honesty_score: number
  profile_data: any
  inconsistencies: Array<{
    type: 'critical' | 'moderate' | 'minor'
    category: string
    description: string
    resumeValue: string
    linkedinValue: string
    impact: 'positive' | 'negative' | 'neutral'
    recommendation: string
  }>
  verified_info: string[]
  red_flags: string[]
  positive_indicators: string[]
  recommendations: string[]
  profile_completeness: number
  professional_score: number
  chain_of_thought: string[]
}

interface LinkedInAnalysisDropdownProps {
  analysis: LinkedInAnalysis
  candidateName: string
}

export default function LinkedInAnalysisDropdown({ analysis, candidateName }: LinkedInAnalysisDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'inconsistencies' | 'profile' | 'verification'>('overview')

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'negative':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getInconsistencyColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500 bg-red-50'
      case 'moderate':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const overallHiringImpact = () => {
    const criticalIssues = analysis.inconsistencies.filter(i => i.type === 'critical').length
    const score = analysis.honesty_score

    if (score >= 85 && criticalIssues === 0) {
      return { verdict: 'Strong Positive', color: 'text-green-700 bg-green-100', icon: '✅' }
    } else if (score >= 70 && criticalIssues <= 1) {
      return { verdict: 'Positive', color: 'text-green-600 bg-green-50', icon: '👍' }
    } else if (score >= 55) {
      return { verdict: 'Proceed with Caution', color: 'text-yellow-600 bg-yellow-50', icon: '⚠️' }
    } else {
      return { verdict: 'High Risk', color: 'text-red-600 bg-red-50', icon: '❌' }
    }
  }

  const hiringImpact = overallHiringImpact()

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
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">LinkedIn Analysis</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.honesty_score)}`}>
            {analysis.honesty_score}% Credibility
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${hiringImpact.color}`}>
            {hiringImpact.icon} {hiringImpact.verdict}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <a
            href={analysis.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
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
            {/* Tab Navigation */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'inconsistencies', label: 'Issues', icon: AlertTriangle },
                  { id: 'profile', label: 'Profile Data', icon: User },
                  { id: 'verification', label: 'Verification', icon: CheckCircle }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                      activeTab === id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    {id === 'inconsistencies' && analysis.inconsistencies.length > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                        {analysis.inconsistencies.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Score Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.honesty_score).split(' ')[0]}`}>
                        {analysis.honesty_score}%
                      </div>
                      <div className="text-sm text-gray-600">Honesty Score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.profile_completeness).split(' ')[0]}`}>
                        {analysis.profile_completeness}%
                      </div>
                      <div className="text-sm text-gray-600">Completeness</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.professional_score).split(' ')[0]}`}>
                        {analysis.professional_score}%
                      </div>
                      <div className="text-sm text-gray-600">Professional</div>
                    </div>
                  </div>

                  {/* Quick Summary */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Summary</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Positive Indicators */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-green-700 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Positive Indicators
                        </h5>
                        {analysis.positive_indicators.length > 0 ? (
                          <ul className="space-y-1">
                            {analysis.positive_indicators.slice(0, 3).map((indicator, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No positive indicators identified</p>
                        )}
                      </div>

                      {/* Red Flags */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-red-700 flex items-center">
                          <XCircle className="h-4 w-4 mr-2" />
                          Red Flags
                        </h5>
                        {analysis.red_flags.length > 0 ? (
                          <ul className="space-y-1">
                            {analysis.red_flags.slice(0, 3).map((flag, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <span className="text-red-500 mr-2">•</span>
                                {flag}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No red flags identified</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hiring Recommendation */}
                  <div className={`p-4 rounded-lg border-l-4 ${hiringImpact.color.includes('green') ? 'border-l-green-500 bg-green-50' : hiringImpact.color.includes('yellow') ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-red-500 bg-red-50'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{hiringImpact.icon}</span>
                      <h4 className="font-semibold">Hiring Recommendation: {hiringImpact.verdict}</h4>
                    </div>
                    {analysis.recommendations.length > 0 && (
                      <ul className="space-y-1">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Inconsistencies Tab */}
              {activeTab === 'inconsistencies' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {analysis.inconsistencies.length > 0 ? (
                    analysis.inconsistencies.map((inconsistency, index) => (
                      <div
                        key={index}
                        className={`p-4 border-l-4 rounded-lg ${getInconsistencyColor(inconsistency.type)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getImpactIcon(inconsistency.impact)}
                            <span className="font-semibold text-gray-900 capitalize">
                              {inconsistency.type} - {inconsistency.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{inconsistency.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-3 mb-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Resume:</span>
                            <p className="text-gray-800">{inconsistency.resumeValue}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">LinkedIn:</span>
                            <p className="text-gray-800">{inconsistency.linkedinValue}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Recommendation:</span>
                          <p className="text-gray-700">{inconsistency.recommendation}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">No Inconsistencies Found</h4>
                      <p className="text-gray-600">The LinkedIn profile appears consistent with the resume.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Profile Data Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Basic Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {analysis.profile_data.name}</div>
                        <div><span className="font-medium">Title:</span> {analysis.profile_data.title}</div>
                        <div><span className="font-medium">Company:</span> {analysis.profile_data.company}</div>
                        <div><span className="font-medium">Location:</span> {analysis.profile_data.location}</div>
                        <div><span className="font-medium">Connections:</span> {analysis.profile_data.connections}+</div>
                      </div>
                    </div>

                    {/* Skills & Certifications */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        Skills & Certifications
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analysis.profile_data.skills.slice(0, 8).map((skill: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        {analysis.profile_data.certifications.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Certifications:</span>
                            <ul className="mt-1 text-sm text-gray-700">
                              {analysis.profile_data.certifications.map((cert: string, index: number) => (
                                <li key={index}>• {cert}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Work Experience
                    </h4>
                    <div className="space-y-3">
                      {analysis.profile_data.experience.map((exp: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium text-gray-900">{exp.title}</h5>
                              <p className="text-sm text-gray-600">{exp.company}</p>
                            </div>
                            <span className="text-xs text-gray-500">{exp.duration}</span>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-gray-700">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Verification Tab */}
              {activeTab === 'verification' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Verified Information</h4>
                    <ul className="space-y-2">
                      {analysis.verified_info.map((info, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {info}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Chain of Thought */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Analysis Process</h4>
                    <div className="space-y-2">
                      {analysis.chain_of_thought.map((thought, index) => (
                        <div key={index} className="flex items-start text-sm">
                          <span className="text-blue-500 mr-2 mt-0.5">•</span>
                          <span className="text-gray-700">{thought}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 