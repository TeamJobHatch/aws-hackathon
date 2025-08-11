'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, Share2, Trophy, Users, TrendingUp, ExternalLink, Github, Linkedin, Globe, Mail, Phone } from 'lucide-react'
import LinkedInAnalysisDropdown from './LinkedInAnalysisDropdown'
import GitHubAnalysisDropdown from './GitHubAnalysisDropdown'
import ChainOfThoughtDisplay from './ChainOfThoughtDisplay'

interface ChainOfThoughtStep {
  id: string
  message: string
  timestamp: number
  status: 'processing' | 'completed' | 'error'
  type?: 'linkedin' | 'github' | 'resume' | 'general'
}

interface EnhancedResultsStepProps {
  state: any
  updateState: (updates: any) => void
  goToPreviousStep: () => void
  goToStep: (step: any) => void
}

export default function EnhancedResultsStep({ 
  state, 
  updateState, 
  goToPreviousStep, 
  goToStep 
}: EnhancedResultsStepProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [chainOfThoughtSteps, setChainOfThoughtSteps] = useState<ChainOfThoughtStep[]>([])
  const [showChainOfThought, setShowChainOfThought] = useState(false)

  // Generate chain of thought for the analysis process
  useEffect(() => {
    if (state.resumes.length > 0) {
      const steps: ChainOfThoughtStep[] = []
      let stepId = 0

      // Add general analysis steps
      steps.push({
        id: `step_${stepId++}`,
        message: `📄 Starting analysis of ${state.resumes.length} candidate(s)`,
        timestamp: Date.now() - 30000,
        status: 'completed',
        type: 'general'
      })

      steps.push({
        id: `step_${stepId++}`,
        message: `🎯 Job requirements analysis: ${state.jobDescription?.skills?.length || 0} key skills identified`,
        timestamp: Date.now() - 25000,
        status: 'completed',
        type: 'resume'
      })

      // Add steps for each candidate
      state.resumes.forEach((resume: any, index: number) => {
        const analysisTime = Date.now() - (20000 - index * 3000)
        
        steps.push({
          id: `step_${stepId++}`,
          message: `👤 Processing ${resume.candidateName}'s resume and profile`,
          timestamp: analysisTime,
          status: 'completed',
          type: 'resume'
        })

        if (resume.links?.linkedin) {
          steps.push({
            id: `step_${stepId++}`,
            message: `🔗 Analyzing LinkedIn profile for ${resume.candidateName}`,
            timestamp: analysisTime + 1000,
            status: 'completed',
            type: 'linkedin'
          })

          if (resume.analysis?.linkedinAnalysis) {
            const linkedinAnalysis = resume.analysis.linkedinAnalysis
            steps.push({
              id: `step_${stepId++}`,
              message: `📊 LinkedIn credibility score: ${linkedinAnalysis.honesty_score}% for ${resume.candidateName}`,
              timestamp: analysisTime + 2000,
              status: 'completed',
              type: 'linkedin'
            })

            if (linkedinAnalysis.inconsistencies?.length > 0) {
              steps.push({
                id: `step_${stepId++}`,
                message: `⚠️ Found ${linkedinAnalysis.inconsistencies.length} inconsistency(ies) in ${resume.candidateName}'s profile`,
                timestamp: analysisTime + 2500,
                status: linkedinAnalysis.inconsistencies.some((i: any) => i.type === 'critical') ? 'error' : 'completed',
                type: 'linkedin'
              })
            }
          }
        }

        if (resume.links?.github) {
          steps.push({
            id: `step_${stepId++}`,
            message: `💻 Analyzing GitHub profile for ${resume.candidateName}`,
            timestamp: analysisTime + 3000,
            status: 'completed',
            type: 'github'
          })
        }
      })

      // Final analysis steps
      steps.push({
        id: `step_${stepId++}`,
        message: `🏆 Ranking candidates by overall match score`,
        timestamp: Date.now() - 5000,
        status: 'completed',
        type: 'general'
      })

      steps.push({
        id: `step_${stepId++}`,
        message: `✅ Analysis complete! Ready for review.`,
        timestamp: Date.now() - 1000,
        status: 'completed',
        type: 'general'
      })

      setChainOfThoughtSteps(steps)
    }
  }, [state.resumes, state.jobDescription])

  const sortedResumes = [...state.resumes].sort((a, b) => {
    const aScore = a.analysis?.matchPercentage || 0
    const bScore = b.analysis?.matchPercentage || 0
    return bScore - aScore
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getRankBadge = (index: number) => {
    const badges = ['🥇', '🥈', '🥉']
    return badges[index] || `#${index + 1}`
  }

  const formatLink = (url: string, type: 'linkedin' | 'github' | 'portfolio' | 'website') => {
    const icons = {
      linkedin: <Linkedin className="h-4 w-4" />,
      github: <Github className="h-4 w-4" />,
      portfolio: <Globe className="h-4 w-4" />,
      website: <ExternalLink className="h-4 w-4" />
    }
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
      >
        {icons[type]}
        <span className="capitalize">{type}</span>
      </a>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎯 Analysis Complete
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI analysis has ranked {state.resumes.length} candidate(s) for the {state.jobDescription?.title} position.
        </p>
      </motion.div>

      {/* Chain of Thought Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowChainOfThought(!showChainOfThought)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <TrendingUp className="h-4 w-4" />
          <span>{showChainOfThought ? 'Hide' : 'Show'} Analysis Process</span>
        </button>
      </div>

      {/* Chain of Thought Display */}
      <AnimatePresence>
        {showChainOfThought && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChainOfThoughtDisplay
              steps={chainOfThoughtSteps}
              isAnalyzing={false}
              title="Complete Analysis Chain of Thought"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{state.resumes.length}</div>
          <div className="text-sm text-gray-600">Candidates Analyzed</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(sortedResumes.reduce((acc, r) => acc + (r.analysis?.matchPercentage || 0), 0) / sortedResumes.length)}%
          </div>
          <div className="text-sm text-gray-600">Average Match</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {sortedResumes.filter(r => r.analysis?.linkedinAnalysis).length}
          </div>
          <div className="text-sm text-gray-600">LinkedIn Profiles</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {state.selectedAIModel === 'openai' ? 'GPT-4o' : 'Gemini 2.5'}
          </div>
          <div className="text-sm text-gray-600">AI Model Used</div>
        </div>
      </motion.div>

      {/* Candidates List */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {sortedResumes.map((resume: any, index: number) => (
          <motion.div
            key={resume.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Candidate Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{getRankBadge(index)}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{resume.candidateName}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      {resume.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{resume.email}</span>
                        </div>
                      )}
                      {resume.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{resume.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Professional Links */}
                    {resume.links && (
                      <div className="flex items-center space-x-4 mt-3">
                        {resume.links.linkedin && formatLink(resume.links.linkedin, 'linkedin')}
                        {resume.links.github && formatLink(resume.links.github, 'github')}
                        {resume.links.portfolio && formatLink(resume.links.portfolio, 'portfolio')}
                        {resume.links.website && formatLink(resume.links.website, 'website')}
                      </div>
                    )}
                    {/* Debug info for development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-400 mt-2 space-y-1">
                        <div>Links: {resume.links ? Object.keys(resume.links).filter(key => resume.links[key]).length : 0} found</div>
                        <div>LinkedIn Analysis: {resume.analysis?.linkedinAnalysis ? '✅' : '❌'}</div>
                        <div>GitHub Analysis: {resume.analysis?.githubAnalysis ? '✅' : '❌'}</div>
                        {resume.analysis?.linkedinAnalysis && (
                          <div>LinkedIn Score: {resume.analysis.linkedinAnalysis.honesty_score}%</div>
                        )}
                        {resume.analysis?.githubAnalysis && (
                          <div>GitHub Score: {resume.analysis.githubAnalysis.technical_score}%</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-semibold border ${getScoreColor(resume.analysis?.matchPercentage || 0)}`}>
                    {resume.analysis?.matchPercentage || 0}% Match
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Overall Score: {resume.analysis?.overallScore || 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Content */}
            <div className="p-6 space-y-6">
              {/* Quick Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                <p className="text-gray-700">{resume.analysis?.summary || 'No summary available'}</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {(resume.analysis?.strengths || []).map((strength: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-yellow-500" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-1">
                    {(resume.analysis?.weaknesses || []).map((weakness: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* LinkedIn Analysis Dropdown */}
              {resume.analysis?.linkedinAnalysis && (
                <LinkedInAnalysisDropdown
                  analysis={resume.analysis.linkedinAnalysis}
                  candidateName={resume.candidateName}
                />
              )}

              {/* GitHub Analysis Dropdown */}
              {resume.analysis?.githubAnalysis && (
                <GitHubAnalysisDropdown
                  analysis={resume.analysis.githubAnalysis}
                  candidateName={resume.candidateName}
                />
              )}

              {/* Skills & Experience */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(resume.analysis?.technicalSkills || []).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Soft Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(resume.analysis?.softSkills || []).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {resume.analysis?.recommendations && resume.analysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                  <ul className="space-y-1">
                    {resume.analysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation */}
      <motion.div 
        className="flex justify-between items-center pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          onClick={goToPreviousStep}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Analysis</span>
        </motion.button>

        <div className="flex space-x-3">
          <motion.button
            className="flex items-center space-x-2 px-6 py-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="h-5 w-5" />
            <span>Export Report</span>
          </motion.button>

          <motion.button
            onClick={() => goToStep('job-description')}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="h-5 w-5" />
            <span>Analyze New Job</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
} 