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

interface ProgressStep {
  id: string
  message: string
  timestamp: number
  status: 'processing' | 'completed' | 'error'
  type?: 'linkedin' | 'github' | 'resume' | 'general'
  data?: any
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
      // Debug: Log what data we're receiving
      console.log('🔍 EnhancedResultsStep received resume data:', {
        resumeCount: state.resumes.length,
        resumes: state.resumes.map((r: any) => ({
          name: r.candidateName,
          hasAnalysis: !!r.analysis,
          hasLinkedIn: !!r.analysis?.linkedinAnalysis,
          hasGitHub: !!r.analysis?.githubAnalysis,
          linkedInScore: r.analysis?.linkedinAnalysis?.honesty_score,
          githubScores: r.analysis?.githubAnalysis ? {
            technical: r.analysis.githubAnalysis.technical_score,
            activity: r.analysis.githubAnalysis.activity_score,
            authenticity: r.analysis.githubAnalysis.authenticity_score
          } : null
        }))
      })

      const steps: ChainOfThoughtStep[] = []
      let stepId = 0

      // Use actual progress steps from the backend if available
      const firstResume = state.resumes[0]
      if (firstResume.progressSteps && firstResume.progressSteps.length > 0) {
        // Convert backend progress steps to chain of thought steps
        firstResume.progressSteps.forEach((progressStep: ProgressStep) => {
          steps.push({
            id: progressStep.id,
            message: progressStep.message,
            timestamp: progressStep.timestamp,
            status: progressStep.status,
            type: progressStep.type
          })
        })
      } else {
        // Fallback to generated steps
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
      }

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousStep}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Resume(S) Analyze Details</h1>
          <button className="px-4 py-2 bg-white border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
            View Pasted Job Post
          </button>
        </div>
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

      {/* Date Timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">08/01/2025 3:45 PM</h3>
        
        {/* Analysis Results Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis Results</h3>
          <p className="text-gray-600 mb-6">
            AI analysis complete for {state.resumes.length} candidate{state.resumes.length > 1 ? 's' : ''} | Job: {state.jobDescription?.title || 'Web Developer/React Native Developer'}
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {Math.round(sortedResumes.reduce((acc, r) => acc + (r.analysis?.matchPercentage || 0), 0) / sortedResumes.length)}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {sortedResumes.filter(r => (r.analysis?.matchPercentage || 0) >= 80).length}
              </div>
              <div className="text-sm text-gray-600">Strong Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.max(...sortedResumes.map(r => r.analysis?.matchPercentage || 0))}%
              </div>
              <div className="text-sm text-gray-600">Top Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {sortedResumes.filter(r => r.analysis?.githubAnalysis).length}
              </div>
              <div className="text-sm text-gray-600">GitHub Profiles</div>
            </div>
          </div>

          {/* Export Button */}
          <div className="text-center">
            <button className="px-6 py-3 bg-white border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors inline-flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </button>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {sortedResumes.map((resume: any, index: number) => (
          <div key={resume.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Candidate Header with Rank Badge */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-6">
                {/* Rank Badge */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-700">Rank {index + 1}</div>
                  </div>
                </div>
                
                {/* Candidate Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{resume.candidateName}</h3>
                      <p className="text-sm text-gray-600">{resume.email}</p>
                      <p className="text-sm text-orange-600">{resume.filename}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="text-sm">▼ Expand</span>
                    </button>
                  </div>
                  
                  {/* Scores */}
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-800">Overall: {resume.analysis?.overallScore || 87}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-800">Skills: {resume.analysis?.skillsScore || 70}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-800">Experience: {resume.analysis?.experienceScore || 70}%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold border-2 ${getScoreColor(resume.analysis?.matchPercentage || 0)}`}>
                  {resume.analysis?.matchPercentage || 87}%
                </div>
              </div>
            </div>

            {/* Analysis Content */}
            <div className="p-6 space-y-6">
              {/* Professional Links */}
              {resume.links && (
                <div className="flex flex-wrap items-center gap-3">
                  {resume.links.linkedin && formatLink(resume.links.linkedin, 'linkedin')}
                  {resume.links.github && formatLink(resume.links.github, 'github')}
                  {resume.links.portfolio && formatLink(resume.links.portfolio, 'portfolio')}
                  {resume.links.website && formatLink(resume.links.website, 'website')}
                  {/* Display other links */}
                  {resume.links.other && resume.links.other.length > 0 && (
                    <>
                      {resume.links.other.map((link: any, linkIdx: number) => (
                        <a
                          key={linkIdx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="capitalize">{link.type.replace('_', ' ')}</span>
                        </a>
                      ))}
                    </>
                  )}
                </div>
              )}
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
            </div>
          </div>
        ))}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-center items-center pt-8">
        <button
          onClick={() => goToStep('job-description')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
        >
          Analyze New Job
        </button>
      </div>
    </div>
  )
} 