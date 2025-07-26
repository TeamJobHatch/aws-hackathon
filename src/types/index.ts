export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface GitHubProfile {
  login: string
  name: string
  bio?: string
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
  repositories?: Repository[]
}

export interface Repository {
  id: number
  name: string
  description?: string
  html_url: string
  language?: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  created_at?: string
  pushed_at?: string
  topics?: string[]
  size?: number
  open_issues_count?: number
}

export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  headline?: string
  profilePicture?: string
  publicProfileUrl?: string
}

export interface CandidateLinks {
  github?: string
  linkedin?: string
  portfolio?: string
  website?: string
  other: { url: string; type: string }[]
}

export interface UploadedFile {
  id: string
  name: string
  type: 'pdf' | 'docx'
  content: string
  uploadedAt: Date
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface JobApplication {
  id: string
  company: string
  position: string
  description: string
  requirements: string[]
  status: 'draft' | 'applied' | 'interview' | 'rejected' | 'accepted'
  createdAt: Date
  updatedAt: Date
}

export interface AIResponse {
  message: string
  suggestions?: string[]
  analysis?: {
    matchPercentage: number
    strengths: string[]
    improvements: string[]
  }
}

// HR-specific types
export interface JobDescription {
  id: string
  title: string
  company: string
  description: string
  requirements: string[]
  qualifications: string[]
  skills: string[]
  experience: string
  location: string
  salary?: string
  uploadedAt: Date
  content: string // Full job description text
}

export interface Resume {
  id: string
  candidateName: string
  email?: string
  phone?: string
  filename: string
  content: string
  uploadedAt: Date
  analysis?: ResumeAnalysis
  links?: CandidateLinks
}

export interface LinkedInProfileData {
  name: string
  title: string
  company: string
  location: string
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
    startDate: string
    endDate: string
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    startYear: string
    endYear: string
  }>
  skills: string[]
  certifications: string[]
  languages: string[]
  connections: number
  profilePicture: boolean
  headline: string
  summary: string
}

export interface InconsistencyAnalysis {
  type: 'critical' | 'moderate' | 'minor'
  category: 'experience' | 'education' | 'skills' | 'personal' | 'timeline'
  description: string
  resumeValue: string
  linkedinValue: string
  impact: 'positive' | 'negative' | 'neutral'
  recommendation: string
}

export interface LinkedInAnalysis {
  profile_url: string
  honesty_score: number
  profile_data: LinkedInProfileData
  inconsistencies: InconsistencyAnalysis[]
  verified_info: string[]
  red_flags: string[]
  positive_indicators: string[]
  recommendations: string[]
  profile_completeness: number
  professional_score: number
  chain_of_thought: string[]
}

export interface ResumeAnalysis {
  matchPercentage: number
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  skillsMatch: SkillMatch[]
  experienceMatch: ExperienceMatch
  recommendations: string[]
  summary: string
  githubAnalysis?: GitHubAnalysis
  linkedinAnalysis?: LinkedInAnalysis
  detailedInsights: string[]
  technicalSkills: string[]
  softSkills: string[]
}

export interface SkillMatch {
  skill: string
  found: boolean
  confidence: number
  evidence?: string[]
}

export interface ExperienceMatch {
  requiredYears: number
  candidateYears: number
  relevantExperience: string[]
  score: number
}

export interface GitHubAnalysis {
  username: string
  profile: GitHubProfile
  relevantRepositories: Repository[]
  technicalScore: number
  activityScore: number
  codeQualityIndicators: string[]
  skillsEvidence?: string[]
  projectHighlights?: string[]
  recommendations?: string[]
  languageBreakdown?: Record<string, number>
  projectCategories?: string[]
  collaborationScore?: number
  portfolioQuality?: number
}

export interface ApplicantComparison {
  jobId: string
  resumes: Resume[]
  ranking: ApplicantRanking[]
  topCandidates: Resume[]
}

export interface ApplicantRanking {
  resumeId: string
  rank: number
  score: number
  highlights: string[]
}

export interface HRAnalysisRequest {
  jobDescription: JobDescription
  resumes: Resume[]
  analysisType: 'individual' | 'comparison' | 'ranking'
  aiModel?: 'openai' | 'gemini'
}

// AI Model Types
export interface AIModelConfig {
  id: 'openai' | 'gemini'
  name: string
  displayName: string
  description: string
  status: 'working' | 'limited' | 'error' | 'unknown'
  available: boolean
  features: {
    analysis: boolean
    embedding: boolean
    structured: boolean
  }
}

export interface ModelTestResults {
  success: boolean
  overallStatus: string
  workingModels: number
  totalModels: number
  recommendation: string
  models: {
    openai: ModelTestResult
    gemini: ModelTestResult
  }
}

export interface ModelTestResult {
  model: string
  success: boolean
  apiStatus: 'working' | 'limited' | 'error'
  message: string
  response?: string
  details?: string
  keyExists: boolean
  keyPrefix?: string
}

// Enhanced Resume Analysis with Model Info
export interface EnhancedResumeAnalysis extends ResumeAnalysis {
  aiModel: 'openai' | 'gemini'
  modelVersion: string
  processingTime: number
  confidence: number
}