'use client'

import { useState } from 'react'
import { Trophy, Medal, Award, User, Star, ChevronDown, ChevronUp, Github, Linkedin, Globe, Download, RotateCcw } from 'lucide-react'
import { Resume } from '@/types'
import { WizardStep } from '../HRWizard'

interface ResultsStepProps {
  state: any
  updateState: (updates: any) => void
  goToStep: (step: WizardStep) => void
}

export default function ResultsStep({ state, updateState, goToStep }: ResultsStepProps) {
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'overall' | 'skills' | 'experience'>('overall')

  // Sort resumes by selected criteria
  const sortedResumes = [...state.resumes].sort((a: Resume, b: Resume) => {
    if (!a.analysis || !b.analysis) return 0
    
    switch (sortBy) {
      case 'skills':
        return b.analysis.matchPercentage - a.analysis.matchPercentage
      case 'experience':
        return (b.analysis.experienceMatch?.score || 0) - (a.analysis.experienceMatch?.score || 0)
      default:
        return b.analysis.overallScore - a.analysis.overallScore
    }
  })

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Award className="h-6 w-6 text-orange-400" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
    }
  }

  const getScoreClass = (score: number) => {
    if (score >= 85) return 'score-excellent'
    if (score >= 75) return 'score-good'
    if (score >= 65) return 'score-fair'
    return 'score-poor'
  }

  const exportResults = () => {
    const results = {
      jobTitle: state.jobDescription?.title,
      company: state.jobDescription?.company,
      analysisDate: new Date().toISOString(),
      candidates: sortedResumes.map((resume: Resume, index: number) => ({
        rank: index + 1,
        name: resume.candidateName,
        filename: resume.filename,
        overallScore: resume.analysis?.overallScore,
        skillsMatch: resume.analysis?.matchPercentage,
        experienceScore: resume.analysis?.experienceMatch?.score,
        strengths: resume.analysis?.strengths,
        weaknesses: resume.analysis?.weaknesses,
        recommendations: resume.analysis?.recommendations
      }))
    }

    const dataStr = JSON.stringify(results, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `candidate-analysis-${state.jobDescription?.title.replace(/\s+/g, '-').toLowerCase()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="container-jobhatch">
      <div className="text-center mb-8">
        <h2 className="heading-lg">Analysis Results</h2>
        <p className="text-gray-600">
          AI analysis complete for {state.resumes.length} candidate{state.resumes.length !== 1 ? 's' : ''} • 
          Job: <span className="font-semibold">{state.jobDescription?.title}</span>
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="jobhatch-card-small text-center">
          <div className="text-2xl font-bold text-jobhatch-orange mb-1">
            {Math.round(sortedResumes.reduce((acc: number, resume: Resume) => 
              acc + (resume.analysis?.overallScore || 0), 0) / sortedResumes.length)}%
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>
        
        <div className="jobhatch-card-small text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {sortedResumes.filter((r: Resume) => (r.analysis?.overallScore || 0) >= 75).length}
          </div>
          <div className="text-sm text-gray-600">Strong Matches</div>
        </div>
        
        <div className="jobhatch-card-small text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {sortedResumes[0]?.analysis?.overallScore || 0}%
          </div>
          <div className="text-sm text-gray-600">Top Score</div>
        </div>
        
        <div className="jobhatch-card-small text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {sortedResumes.filter((r: Resume) => r.analysis?.githubAnalysis).length}
          </div>
          <div className="text-sm text-gray-600">GitHub Profiles</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="form-input-jobhatch text-sm py-2 px-3"
          >
            <option value="overall">Overall Score</option>
            <option value="skills">Skills Match</option>
            <option value="experience">Experience Score</option>
          </select>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={exportResults}
            className="btn-jobhatch-outline flex items-center text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </button>
          
          <button
            onClick={() => goToStep('welcome')}
            className="btn-jobhatch-secondary flex items-center text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {sortedResumes.map((resume: Resume, index: number) => (
          <div
            key={resume.id}
            className={`candidate-card ${
              index === 0 ? 'candidate-rank-1' :
              index === 1 ? 'candidate-rank-2' :
              index === 2 ? 'candidate-rank-3' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              {/* Candidate Info */}
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  {getRankIcon(index)}
                  <span className="text-xs text-gray-500 mt-1">Rank {index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{resume.candidateName}</h3>
                    {resume.email && (
                      <span className="text-sm text-gray-500">{resume.email}</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{resume.filename}</p>
                  
                  {/* Scores */}
                  {resume.analysis && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className={`${getScoreClass(resume.analysis.overallScore)} text-sm`}>
                        Overall: {resume.analysis.overallScore}%
                      </span>
                      <span className={`${getScoreClass(resume.analysis.matchPercentage)} text-sm`}>
                        Skills: {resume.analysis.matchPercentage}%
                      </span>
                      {resume.analysis.experienceMatch && (
                        <span className={`${getScoreClass(resume.analysis.experienceMatch.score)} text-sm`}>
                          Experience: {resume.analysis.experienceMatch.score}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* Platform Links */}
                  <div className="flex items-center space-x-4">
                    {resume.analysis?.githubAnalysis && (
                      <a
                        href={resume.analysis.githubAnalysis.profile.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
                      >
                        <Github className="h-4 w-4 mr-1" />
                        GitHub
                      </a>
                    )}
                    <span className="flex items-center text-gray-400 text-sm">
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn
                    </span>
                    <span className="flex items-center text-gray-400 text-sm">
                      <Globe className="h-4 w-4 mr-1" />
                      Portfolio
                    </span>
                  </div>
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={() => setExpandedCandidate(
                  expandedCandidate === resume.id ? null : resume.id
                )}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                {expandedCandidate === resume.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Expanded Details */}
            {expandedCandidate === resume.id && resume.analysis && (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                {/* AI Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI Analysis Summary</h4>
                  <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg">
                    {resume.analysis.summary}
                  </p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">Key Strengths</h4>
                    <ul className="space-y-2">
                      {resume.analysis.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <span className="text-green-500 mr-2 mt-0.5">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-600 mb-3">Areas for Development</h4>
                    <ul className="space-y-2">
                      {resume.analysis.weaknesses.map((weakness: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <span className="text-red-500 mr-2 mt-0.5">!</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* GitHub Analysis */}
                {resume.analysis.githubAnalysis && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub Profile Analysis
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {resume.analysis.githubAnalysis.technicalScore}/100
                          </div>
                          <div className="text-xs text-gray-600">Technical Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {resume.analysis.githubAnalysis.activityScore}/100
                          </div>
                          <div className="text-xs text-gray-600">Activity Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {resume.analysis.githubAnalysis.relevantRepositories.length}
                          </div>
                          <div className="text-xs text-gray-600">Relevant Repos</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong>@{resume.analysis.githubAnalysis.username}</strong> • 
                        {resume.analysis.githubAnalysis.profile.public_repos} repositories • 
                        {resume.analysis.githubAnalysis.profile.followers} followers
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Hiring Recommendations</h4>
                  <ul className="space-y-2">
                    {resume.analysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <span className="text-blue-500 mr-2 mt-0.5">→</span>
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

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="jobhatch-card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-center">
            <Star className="h-5 w-5 text-green-600 mr-2" />
            Analysis Complete
          </h3>
          <p className="text-sm text-gray-700">
            JobHatch Enterprise has successfully analyzed all candidates. 
            The top candidate is <strong>{sortedResumes[0]?.candidateName}</strong> with 
            a {sortedResumes[0]?.analysis?.overallScore}% overall match.
          </p>
        </div>
      </div>
    </div>
  )
} 