'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronUp, 
  Github, 
  ExternalLink, 
  Star, 
  GitFork, 
  Calendar, 
  Code, 
  Users, 
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  Link,
  Zap,
  Award,
  MessageSquare
} from 'lucide-react'

interface ProjectAnalysis {
  name: string
  html_url: string
  resume_mentioned: boolean
  resume_evidence?: string
  completeness_score: number
  demo_links: Array<{
    type: 'demo' | 'video' | 'documentation' | 'live_site'
    url: string
    description: string
  }>
  code_quality: {
    naming_score: number
    comments_score: number
    structure_score: number
    ai_usage_percentage: number
    overall_score: number
  }
  red_flags: string[]
  recommendations: string[]
  project_highlights: string[]
}

interface GitHubAnalysis {
  username: string
  profile: any
  repository_analysis: ProjectAnalysis[]
  overall_metrics: {
    total_repos: number
    resume_matched_repos: number
    average_code_quality: number
    commit_consistency: number
    collaboration_score: number
  }
  red_flags: string[]
  technical_score: number
  activity_score: number
  recommendations: string[]
  chain_of_thought: string[]
}

interface GitHubAnalysisDropdownProps {
  analysis: GitHubAnalysis
  candidateName: string
}

export default function GitHubAnalysisDropdown({ analysis, candidateName }: GitHubAnalysisDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'quality' | 'redflags'>('overview')

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const overallHiringImpact = () => {
    const techScore = analysis.technical_score || 0
    const activityScore = analysis.activity_score || 0
    const redFlagCount = analysis.red_flags.length
    const avgScore = (techScore + activityScore) / 2

    if (avgScore >= 85 && redFlagCount === 0) {
      return { verdict: 'Exceptional Developer', color: 'text-green-700 bg-green-100', icon: '🚀' }
    } else if (avgScore >= 75 && redFlagCount <= 1) {
      return { verdict: 'Strong Technical Profile', color: 'text-green-600 bg-green-50', icon: '👍' }
    } else if (avgScore >= 60 && redFlagCount <= 2) {
      return { verdict: 'Good Potential', color: 'text-yellow-600 bg-yellow-50', icon: '⚠️' }
    } else if (redFlagCount > 3) {
      return { verdict: 'High Risk', color: 'text-red-600 bg-red-50', icon: '🚨' }
    } else {
      return { verdict: 'Needs Review', color: 'text-orange-600 bg-orange-50', icon: '📋' }
    }
  }

  const hiringImpact = overallHiringImpact()

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'demo': return <Eye className="h-4 w-4" />
      case 'video': return <Activity className="h-4 w-4" />
      case 'documentation': return <FileText className="h-4 w-4" />
      case 'live_site': return <ExternalLink className="h-4 w-4" />
      default: return <Link className="h-4 w-4" />
    }
  }

  const getResumeMatchIcon = (mentioned: boolean) => {
    return mentioned ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />
  }

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
            <span className="font-semibold text-gray-900">GitHub Deep Analysis</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.technical_score || 0)}`}>
            {analysis.technical_score || 0}% Technical
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${hiringImpact.color}`}>
            {hiringImpact.icon} {hiringImpact.verdict}
          </div>
          {analysis.red_flags.length > 0 && (
            <div className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
              {analysis.red_flags.length} flags
            </div>
          )}
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
                  { id: 'quality', label: 'Code Quality', icon: Award },
                  { id: 'redflags', label: 'Red Flags', icon: AlertTriangle }
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
                    {id === 'redflags' && analysis.red_flags.length > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                        {analysis.red_flags.length}
                      </span>
                    )}
                    {id === 'projects' && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                        {analysis.repository_analysis.length}
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.technical_score).split(' ')[0]}`}>
                        {analysis.technical_score}%
                      </div>
                      <div className="text-sm text-gray-600">Technical</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.activity_score).split(' ')[0]}`}>
                        {analysis.activity_score}%
                      </div>
                      <div className="text-sm text-gray-600">Activity</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.overall_metrics.resume_matched_repos}
                      </div>
                      <div className="text-sm text-gray-600">Resume Match</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.overall_metrics.average_code_quality).split(' ')[0]}`}>
                        {analysis.overall_metrics.average_code_quality}%
                      </div>
                      <div className="text-sm text-gray-600">Code Quality</div>
                    </div>
                  </div>

                  {/* Profile Stats */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      GitHub Profile Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Code className="h-4 w-4 text-purple-500" />
                        <span>{analysis.overall_metrics.total_repos} Total Repos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{analysis.profile.followers} Followers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GitFork className="h-4 w-4 text-green-500" />
                        <span>{analysis.profile.following} Following</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span>Since {new Date(analysis.profile.created_at).getFullYear()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hiring Recommendation */}
                  <div className={`p-4 rounded-lg border-l-4 ${
                    hiringImpact.color.includes('green') ? 'border-l-green-500 bg-green-50' : 
                    hiringImpact.color.includes('yellow') ? 'border-l-yellow-500 bg-yellow-50' : 
                    hiringImpact.color.includes('red') ? 'border-l-red-500 bg-red-50' :
                    'border-l-purple-500 bg-purple-50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{hiringImpact.icon}</span>
                      <h4 className="font-semibold">Technical Assessment: {hiringImpact.verdict}</h4>
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

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {analysis.repository_analysis.length > 0 ? (
                    analysis.repository_analysis.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        {/* Project Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            {getResumeMatchIcon(project.resume_mentioned)}
                            <div>
                              <h5 className="font-semibold text-gray-900 flex items-center space-x-2">
                                <span>{project.name}</span>
                                <a
                                  href={project.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-800"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </h5>
                              {project.resume_mentioned && project.resume_evidence && (
                                <p className="text-sm text-green-700 mt-1">
                                  📝 Resume: {project.resume_evidence}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(project.completeness_score)}`}>
                              {project.completeness_score}% Complete
                            </div>
                          </div>
                        </div>

                        {/* Demo Links */}
                        {project.demo_links.length > 0 && (
                          <div className="mb-3">
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Available Links:</h6>
                            <div className="flex flex-wrap gap-2">
                              {project.demo_links.map((link, linkIndex) => (
                                <a
                                  key={linkIndex}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                >
                                  {getLinkIcon(link.type)}
                                  <span>{link.description}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Code Quality Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className={`text-sm font-bold ${getScoreColor(project.code_quality.naming_score).split(' ')[0]}`}>
                              {project.code_quality.naming_score}%
                            </div>
                            <div className="text-xs text-gray-600">Naming</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className={`text-sm font-bold ${getScoreColor(project.code_quality.comments_score).split(' ')[0]}`}>
                              {project.code_quality.comments_score}%
                            </div>
                            <div className="text-xs text-gray-600">Comments</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className={`text-sm font-bold ${getScoreColor(project.code_quality.structure_score).split(' ')[0]}`}>
                              {project.code_quality.structure_score}%
                            </div>
                            <div className="text-xs text-gray-600">Structure</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-sm font-bold text-orange-600">
                              {project.code_quality.ai_usage_percentage}%
                            </div>
                            <div className="text-xs text-gray-600">AI Usage</div>
                          </div>
                        </div>

                        {/* Project Highlights */}
                        {project.project_highlights.length > 0 && (
                          <div className="mb-3">
                            <h6 className="text-sm font-medium text-gray-700 mb-1">Highlights:</h6>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {project.project_highlights.map((highlight, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 mr-2">•</span>
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Project Red Flags */}
                        {project.red_flags.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-red-700 mb-1">⚠️ Concerns:</h6>
                            <ul className="text-sm text-red-600 space-y-1">
                              {project.red_flags.map((flag, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-red-500 mr-2">•</span>
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Code className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">No Projects Analyzed</h4>
                      <p className="text-gray-600">No suitable repositories found for detailed analysis.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Code Quality Tab */}
              {activeTab === 'quality' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Overall Quality Metrics */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Code Quality Analysis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Average Naming Quality</span>
                            <span className="text-sm font-bold text-gray-900">
                              {Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.naming_score, 0) / analysis.repository_analysis.length) || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.naming_score, 0) / analysis.repository_analysis.length) || 0}%`}}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Documentation Quality</span>
                            <span className="text-sm font-bold text-gray-900">
                              {Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.comments_score, 0) / analysis.repository_analysis.length) || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{width: `${Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.comments_score, 0) / analysis.repository_analysis.length) || 0}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Project Structure</span>
                            <span className="text-sm font-bold text-gray-900">
                              {Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.structure_score, 0) / analysis.repository_analysis.length) || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{width: `${Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.structure_score, 0) / analysis.repository_analysis.length) || 0}%`}}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">AI Usage Detection</span>
                            <span className="text-sm font-bold text-orange-600">
                              {Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.ai_usage_percentage, 0) / analysis.repository_analysis.length) || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{width: `${Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.ai_usage_percentage, 0) / analysis.repository_analysis.length) || 0}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Usage Analysis */}
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h5 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      AI Usage Analysis
                    </h5>
                    <p className="text-sm text-orange-700 mb-2">
                      Average AI-generated code detected: {Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.ai_usage_percentage, 0) / analysis.repository_analysis.length) || 0}%
                    </p>
                    <div className="text-sm text-orange-600">
                      {Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.ai_usage_percentage, 0) / analysis.repository_analysis.length) < 30 
                        ? "✅ Low AI usage indicates original work"
                        : Math.round(analysis.repository_analysis.reduce((sum, p) => sum + p.code_quality.ai_usage_percentage, 0) / analysis.repository_analysis.length) < 60
                        ? "⚠️ Moderate AI usage - verify understanding in interview"
                        : "🚨 High AI usage - conduct technical assessment"
                      }
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Red Flags Tab */}
              {activeTab === 'redflags' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {analysis.red_flags.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-red-800 mb-3">🚨 Global Red Flags</h4>
                      {analysis.red_flags.map((flag, index) => (
                        <div key={index} className="p-4 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">{flag}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">No Red Flags Detected</h4>
                      <p className="text-gray-600">The GitHub profile appears authentic and consistent.</p>
                    </div>
                  )}

                  {/* Project-specific red flags */}
                  {analysis.repository_analysis.some(p => p.red_flags.length > 0) && (
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-3">⚠️ Project-Specific Concerns</h4>
                      {analysis.repository_analysis
                        .filter(p => p.red_flags.length > 0)
                        .map((project, index) => (
                          <div key={index} className="p-4 border-l-4 border-l-orange-500 bg-orange-50 rounded-lg mb-3">
                            <h5 className="font-medium text-orange-800 mb-2">{project.name}</h5>
                            <ul className="space-y-1">
                              {project.red_flags.map((flag, flagIndex) => (
                                <li key={flagIndex} className="text-sm text-orange-700 flex items-start">
                                  <span className="text-orange-500 mr-2">•</span>
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
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