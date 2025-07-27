'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Github, ExternalLink, Star, GitFork, Calendar, Code, Users, Activity, CheckCircle, AlertTriangle, XCircle, Zap, Brain, Link as LinkIcon } from 'lucide-react'

interface DemoLink {
  type: 'demo' | 'video' | 'documentation' | 'live_site' | 'github_pages'
  url: string
  description: string
  working: boolean
  hiring_impact: 'positive' | 'neutral' | 'negative'
}

interface RedFlag {
  type: 'critical' | 'moderate' | 'minor'
  description: string
  evidence: string
  hiring_impact: 'negative' | 'caution'
}

interface PositiveIndicator {
  type: 'technical' | 'professional' | 'collaboration'
  description: string
  evidence: string
  hiring_impact: 'positive' | 'strong_positive'
}

interface Recommendation {
  action: string
  priority: 'high' | 'medium' | 'low'
  hiring_impact: 'positive' | 'negative' | 'neutral'
}

interface GitHubAnalysisDropdownProps {
  analysis: {
    profile?: any
    technical_score?: number
    activity_score?: number
    authenticity_score?: number
    overall_metrics?: any
    repository_analysis?: Array<{
      name: string
      html_url: string
      resume_mentioned: boolean
      resume_evidence?: string
      completeness_score: number
      demo_links: DemoLink[]
      code_quality: {
        naming_score: number
        comments_score: number
        structure_score: number
        ai_usage_percentage: number
        overall_score: number
        professional_readme: boolean
        has_tests: boolean
        follows_conventions: boolean
        gemini_confidence: number
      }
      red_flags: RedFlag[]
      positive_indicators: PositiveIndicator[]
      recommendations: Recommendation[]
      project_highlights: string[]
      technologies_detected: string[]
      project_complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      estimated_time_investment: string
      collaboration_evidence: {
        is_group_project: boolean
        evidence: string[]
        individual_contribution_clarity: number
        hiring_impact: 'positive' | 'negative' | 'neutral'
      }
    }>
    red_flags?: string[]
    positive_indicators?: string[]
    recommendations?: string[]
    hiring_verdict?: {
      recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire'
      confidence: number
      reasoning: string[]
    }
    gemini_insights?: {
      ai_detection_confidence: number
      overall_assessment: string
      hiring_recommendation: string
    }
  }
  candidateName: string
}

export default function GitHubAnalysisDropdown({ analysis, candidateName }: GitHubAnalysisDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'insights' | 'verdict'>('overview')

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'expert': return 'bg-purple-100 text-purple-700'
      case 'advanced': return 'bg-blue-100 text-blue-700'
      case 'intermediate': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getHiringImpactIcon = (impact: string) => {
    switch (impact) {
      case 'strong_positive':
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'negative':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'caution':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />
    }
  }

  const getHiringImpactColor = (impact: string) => {
    switch (impact) {
      case 'strong_positive':
        return 'border-l-green-600 bg-green-50'
      case 'positive':
        return 'border-l-green-500 bg-green-50'
      case 'negative':
        return 'border-l-red-500 bg-red-50'
      case 'caution':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-gray-400 bg-gray-50'
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'strong_hire':
        return 'text-green-700 bg-green-100 border-green-200'
      case 'hire':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'maybe':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'no_hire':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'strong_hire': return '🚀'
      case 'hire': return '✅'
      case 'maybe': return '⚠️'
      case 'no_hire': return '❌'
      default: return '❓'
    }
  }

  const overallHiringImpact = () => {
    const techScore = analysis.technical_score || 0
    const activityScore = analysis.activity_score || 0
    const authenticityScore = analysis.authenticity_score || 0
    const avgScore = (techScore + activityScore + authenticityScore) / 3

    if (analysis.hiring_verdict) {
      const verdict = analysis.hiring_verdict.recommendation
      const icon = getVerdictIcon(verdict)
      const color = getVerdictColor(verdict)
      return { 
        verdict: verdict.replace('_', ' ').toUpperCase(), 
        color, 
        icon,
        confidence: analysis.hiring_verdict.confidence
      }
    }

    // Fallback logic
    if (avgScore >= 85) {
      return { verdict: 'STRONG HIRE', color: 'text-green-700 bg-green-100', icon: '🚀', confidence: 90 }
    } else if (avgScore >= 70) {
      return { verdict: 'HIRE', color: 'text-green-600 bg-green-50', icon: '✅', confidence: 75 }
    } else if (avgScore >= 50) {
      return { verdict: 'MAYBE', color: 'text-yellow-600 bg-yellow-50', icon: '⚠️', confidence: 60 }
    } else {
      return { verdict: 'NO HIRE', color: 'text-red-600 bg-red-50', icon: '❌', confidence: 80 }
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
            {analysis.gemini_insights && (
              <Brain className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.technical_score || 0)}`}>
            {analysis.technical_score || 0}% Technical
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${hiringImpact.color}`}>
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
            {/* Tab Navigation */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Activity },
                  { id: 'projects', label: 'Projects', icon: Code },
                  { id: 'insights', label: 'AI Insights', icon: Brain },
                  { id: 'verdict', label: 'Verdict', icon: CheckCircle }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                      activeTab === id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
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
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.technical_score || 0).split(' ')[0]}`}>
                        {analysis.technical_score || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Technical</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.activity_score || 0).split(' ')[0]}`}>
                        {analysis.activity_score || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Activity</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.authenticity_score || 0).split(' ')[0]}`}>
                        {analysis.authenticity_score || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Authenticity</div>
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

                  {/* Quick Summary */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Positive Indicators */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Positive Indicators
                      </h4>
                      {analysis.positive_indicators && analysis.positive_indicators.length > 0 ? (
                        <ul className="space-y-1">
                          {analysis.positive_indicators.slice(0, 3).map((indicator, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No major strengths identified</p>
                      )}
                    </div>

                    {/* Red Flags */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        Red Flags
                      </h4>
                      {analysis.red_flags && analysis.red_flags.length > 0 ? (
                        <ul className="space-y-1">
                          {analysis.red_flags.slice(0, 3).map((flag, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              {flag}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No major concerns identified</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {analysis.repository_analysis && analysis.repository_analysis.length > 0 ? (
                    analysis.repository_analysis.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                        {/* Project Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-semibold text-gray-900">{project.name}</h5>
                              <a
                                href={project.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 text-xs rounded ${getComplexityColor(project.project_complexity)}`}>
                                {project.project_complexity}
                              </span>
                              {project.resume_mentioned && (
                                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                                  ✓ Resume Match
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${getScoreColor(project.code_quality.overall_score).split(' ')[0]}`}>
                              {project.code_quality.overall_score}%
                            </div>
                            <div className="text-xs text-gray-500">Quality Score</div>
                          </div>
                        </div>

                        {/* Demo Links */}
                        {project.demo_links.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <LinkIcon className="h-4 w-4 mr-1" />
                              Live Demos
                            </h6>
                            <div className="space-y-1">
                              {project.demo_links.map((link, idx) => (
                                <div key={idx} className={`p-2 border-l-4 rounded-r ${getHiringImpactColor(link.hiring_impact)}`}>
                                  <div className="flex items-center justify-between">
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      {link.description}
                                    </a>
                                    <div className="flex items-center space-x-2">
                                      {getHiringImpactIcon(link.hiring_impact)}
                                      <span className="text-xs text-gray-500 capitalize">{link.type}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Code Quality Breakdown */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">AI Usage:</span>
                            <span className={`ml-2 ${project.code_quality.ai_usage_percentage > 50 ? 'text-orange-600' : 'text-green-600'}`}>
                              {project.code_quality.ai_usage_percentage}%
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Gemini Confidence:</span>
                            <span className="ml-2 text-blue-600">{project.code_quality.gemini_confidence}%</span>
                          </div>
                        </div>

                        {/* Red Flags & Positive Indicators */}
                        {(project.red_flags.length > 0 || project.positive_indicators.length > 0) && (
                          <div className="grid md:grid-cols-2 gap-4">
                            {project.red_flags.length > 0 && (
                              <div>
                                <h6 className="text-sm font-medium text-red-700 mb-2">Issues</h6>
                                <div className="space-y-1">
                                  {project.red_flags.map((flag, idx) => (
                                    <div key={idx} className={`p-2 border-l-4 rounded-r ${getHiringImpactColor(flag.hiring_impact)}`}>
                                      <div className="flex items-start space-x-2">
                                        {getHiringImpactIcon(flag.hiring_impact)}
                                        <div>
                                          <div className="text-sm font-medium">{flag.description}</div>
                                          <div className="text-xs text-gray-600">{flag.evidence}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {project.positive_indicators.length > 0 && (
                              <div>
                                <h6 className="text-sm font-medium text-green-700 mb-2">Strengths</h6>
                                <div className="space-y-1">
                                  {project.positive_indicators.map((indicator, idx) => (
                                    <div key={idx} className={`p-2 border-l-4 rounded-r ${getHiringImpactColor(indicator.hiring_impact)}`}>
                                      <div className="flex items-start space-x-2">
                                        {getHiringImpactIcon(indicator.hiring_impact)}
                                        <div>
                                          <div className="text-sm font-medium">{indicator.description}</div>
                                          <div className="text-xs text-gray-600">{indicator.evidence}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Technologies */}
                        {project.technologies_detected.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Technologies</h6>
                            <div className="flex flex-wrap gap-1">
                              {project.technologies_detected.map((tech, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No project analysis available
                    </div>
                  )}
                </motion.div>
              )}

              {/* AI Insights Tab */}
              {activeTab === 'insights' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {analysis.gemini_insights ? (
                    <>
                      <div className="flex items-center space-x-2 mb-4">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">Gemini 2.5 Flash Insights</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {analysis.gemini_insights.ai_detection_confidence}% Confidence
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">Overall Assessment</h5>
                          <p className="text-blue-800">{analysis.gemini_insights.overall_assessment}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h5 className="font-medium text-purple-900 mb-2">Hiring Recommendation</h5>
                          <p className="text-purple-800">{analysis.gemini_insights.hiring_recommendation}</p>
                        </div>
                      </div>

                      {/* AI Usage Analysis */}
                      {analysis.repository_analysis && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">AI Usage Analysis</h5>
                          <div className="space-y-2">
                            {analysis.repository_analysis.map((project, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="font-medium">{project.name}</span>
                                <div className="flex items-center space-x-3">
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    project.code_quality.ai_usage_percentage > 70 ? 'bg-red-100 text-red-700' :
                                    project.code_quality.ai_usage_percentage > 40 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {project.code_quality.ai_usage_percentage}% AI
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {project.code_quality.gemini_confidence}% confidence
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No AI insights available</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Verdict Tab */}
              {activeTab === 'verdict' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Hiring Verdict */}
                  <div className={`p-6 rounded-lg border-l-4 ${hiringImpact.color.replace('text-', 'border-l-').replace('bg-', '').split(' ')[0]} ${hiringImpact.color}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">{hiringImpact.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold">Final Verdict: {hiringImpact.verdict}</h3>
                        <p className="text-sm opacity-75">Confidence: {hiringImpact.confidence}%</p>
                      </div>
                    </div>
                    
                    {analysis.hiring_verdict?.reasoning && (
                      <ul className="space-y-1">
                        {analysis.hiring_verdict.reasoning.map((reason, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="mr-2">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Action Items</h4>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <span className="text-sm">{rec}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 