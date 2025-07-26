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

                  {/* Platform Links - AI Extracted */}
                  <div className="flex items-center flex-wrap gap-3 mb-3">
                    {resume.links?.github && (
                      <a
                        href={resume.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-white bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-modern hover-lift"
                        title="View GitHub Profile"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub Profile
                      </a>
                    )}
                    {resume.links?.linkedin && (
                      <a
                        href={resume.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-glow-blue hover-lift"
                        title="View LinkedIn Profile"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn Profile
                      </a>
                    )}
                    {resume.links?.portfolio && (
                      <a
                        href={resume.links.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-modern hover-lift"
                        title="View Portfolio"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Portfolio
                      </a>
                    )}
                    {resume.links?.website && (
                      <a
                        href={resume.links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-modern hover-lift"
                        title="View Website"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    )}
                    {resume.links?.other && resume.links.other.length > 0 && (
                      <div className="flex items-center space-x-2">
                        {resume.links.other.slice(0, 2).map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-white bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                            title={`View ${link.type}`}
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            {link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Debug: Always show link status */}
                  
                  {(!resume.links?.github && !resume.links?.linkedin && !resume.links?.portfolio && !resume.links?.website && (!resume.links?.other || resume.links.other.length === 0)) && (
                    <div className="text-sm text-orange-600 italic mb-3 bg-orange-50 p-2 rounded">
                      ⚠ No professional links found in resume - Check console for debugging details
                    </div>
                  )}
                  
                  {/* Debug info for development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-400 mb-2">
                      Debug: Links object = {JSON.stringify(resume.links)}
                    </div>
                  )}
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

                {/* Detailed Insights */}
                {resume.analysis.detailedInsights && resume.analysis.detailedInsights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Detailed Analysis</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <ul className="space-y-2">
                        {resume.analysis.detailedInsights.map((insight: string, idx: number) => (
                          <li key={idx} className="flex items-start text-sm text-gray-700">
                            <span className="text-blue-500 mr-2 mt-0.5">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Skills Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-3">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resume.analysis.technicalSkills?.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {(!resume.analysis.technicalSkills || resume.analysis.technicalSkills.length === 0) && (
                        <span className="text-sm text-gray-500 italic">No technical skills identified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-600 mb-3">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resume.analysis.softSkills?.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {(!resume.analysis.softSkills || resume.analysis.softSkills.length === 0) && (
                        <span className="text-sm text-gray-500 italic">No soft skills identified</span>
                      )}
                    </div>
                  </div>
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

                {/* LinkedIn Analysis & Honesty Score */}
                {resume.analysis.linkedinAnalysis && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn Profile & Honesty Assessment
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                      {/* Honesty Score */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            resume.analysis.linkedinAnalysis.honesty_score >= 80 ? 'text-green-600' :
                            resume.analysis.linkedinAnalysis.honesty_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {resume.analysis.linkedinAnalysis.honesty_score}/100
                          </div>
                          <div className="text-xs text-gray-600">Honesty Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {resume.analysis.linkedinAnalysis.profile_completeness}/100
                          </div>
                          <div className="text-xs text-gray-600">Profile Quality</div>
                        </div>
                      </div>

                      {/* LinkedIn Profile Link */}
                      <div className="p-3 bg-white rounded border">
                        <a 
                          href={resume.analysis.linkedinAnalysis.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View LinkedIn Profile →
                        </a>
                      </div>

                      {/* Verified Information */}
                      {resume.analysis.linkedinAnalysis.verified_info.length > 0 && (
                        <div>
                          <h5 className="font-medium text-green-700 mb-2">✓ Verified Information</h5>
                          <ul className="space-y-1">
                            {resume.analysis.linkedinAnalysis.verified_info.map((info: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                                {info}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Inconsistencies */}
                      {resume.analysis.linkedinAnalysis.inconsistencies && resume.analysis.linkedinAnalysis.inconsistencies.length > 0 && (
                        <div>
                          <h5 className="font-medium text-red-700 mb-2">⚠ Potential Inconsistencies</h5>
                          <ul className="space-y-1">
                            {resume.analysis.linkedinAnalysis.inconsistencies.map((inconsistency: any, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="text-red-500 mr-2 mt-0.5">⚠</span>
                                {inconsistency.description || inconsistency}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* GitHub Analysis */}
                {resume.analysis.githubAnalysis && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub Profile Analysis
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      {/* GitHub Scores */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {resume.analysis.githubAnalysis.technicalScore}/100
                          </div>
                          <div className="text-xs text-gray-600">Technical</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {resume.analysis.githubAnalysis.activityScore}/100
                          </div>
                          <div className="text-xs text-gray-600">Activity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {resume.analysis.githubAnalysis.collaborationScore || 0}/100
                          </div>
                          <div className="text-xs text-gray-600">Collaboration</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {resume.analysis.githubAnalysis.relevantRepositories.length}
                          </div>
                          <div className="text-xs text-gray-600">Projects</div>
                        </div>
                      </div>
                      
                      {/* Profile Info */}
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="text-sm text-gray-700">
                          <div className="font-medium">
                            <a 
                              href={resume.analysis.githubAnalysis.profile.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              @{resume.analysis.githubAnalysis.username}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500">
                            {resume.analysis.githubAnalysis.profile.public_repos} repositories • 
                            {resume.analysis.githubAnalysis.profile.followers} followers
                          </div>
                        </div>
                        {resume.analysis.githubAnalysis.profile.bio && (
                          <div className="text-xs text-gray-600 max-w-xs truncate">
                            {resume.analysis.githubAnalysis.profile.bio}
                          </div>
                        )}
                      </div>

                      {/* Language Breakdown */}
                      {resume.analysis.githubAnalysis.languageBreakdown && Object.keys(resume.analysis.githubAnalysis.languageBreakdown).length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">Programming Languages</h5>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(resume.analysis.githubAnalysis.languageBreakdown).map(([lang, percentage]: [string, any], idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800"
                              >
                                {lang}: {percentage}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Project Categories */}
                      {resume.analysis.githubAnalysis.projectCategories && resume.analysis.githubAnalysis.projectCategories.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">Project Categories</h5>
                          <div className="flex flex-wrap gap-2">
                            {resume.analysis.githubAnalysis.projectCategories.map((category: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Project Highlights */}
                      {resume.analysis.githubAnalysis.projectHighlights && resume.analysis.githubAnalysis.projectHighlights.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">Notable Projects</h5>
                          <ul className="space-y-2">
                            {resume.analysis.githubAnalysis.projectHighlights.map((project: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start p-2 bg-white rounded">
                                <span className="text-blue-500 mr-2 mt-0.5">▶</span>
                                {project}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Repository List */}
                      {resume.analysis.githubAnalysis.relevantRepositories.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">Recent Repositories</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {resume.analysis.githubAnalysis.relevantRepositories.slice(0, 6).map((repo: any, idx: number) => (
                              <div key={idx} className="p-2 bg-white rounded border text-xs">
                                <div className="font-medium">
                                  <a 
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    {repo.name}
                                  </a>
                                </div>
                                <div className="text-gray-500 truncate">
                                  {repo.description || 'No description'}
                                </div>
                                <div className="text-gray-400 mt-1">
                                  {repo.language} • ⭐ {repo.stargazers_count} • 🍴 {repo.forks_count}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Code Quality Indicators */}
                      {resume.analysis.githubAnalysis.codeQualityIndicators.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">Code Quality Indicators</h5>
                          <ul className="space-y-1">
                            {resume.analysis.githubAnalysis.codeQualityIndicators.map((indicator: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="text-yellow-500 mr-2 mt-0.5">⭐</span>
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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