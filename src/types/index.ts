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

// Enhanced GitHub Analysis Types (Gemini-powered)
export interface GitHubDemoLink {
  type: 'demo' | 'video' | 'documentation' | 'live_site' | 'github_pages'
  url: string
  description: string
  working: boolean
  hiring_impact: 'positive' | 'neutral' | 'negative'
}

export interface GitHubRedFlag {
  type: 'critical' | 'moderate' | 'minor'
  description: string
  evidence: string
  hiring_impact: 'negative' | 'caution'
}

export interface GitHubPositiveIndicator {
  type: 'technical' | 'professional' | 'collaboration'
  description: string
  evidence: string
  hiring_impact: 'positive' | 'strong_positive'
}

export interface GitHubRecommendation {
  action: string
  priority: 'high' | 'medium' | 'low'
  hiring_impact: 'positive' | 'negative' | 'neutral'
}

export interface GitHubProjectAnalysis {
  name: string
  html_url: string
  resume_mentioned: boolean
  resume_evidence?: string
  completeness_score: number
  demo_links: GitHubDemoLink[]
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
  red_flags: GitHubRedFlag[]
  positive_indicators: GitHubPositiveIndicator[]
  recommendations: GitHubRecommendation[]
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
}

export interface GitHubAnalysis {
  username: string
  profile: {
    login: string
    name: string
    bio?: string
    avatar_url: string
    html_url: string
    public_repos: number
    followers: number
    following: number
    created_at: string
    updated_at: string
    company?: string
    location?: string
  }
  repository_analysis: GitHubProjectAnalysis[]
  overall_metrics: {
    total_repos: number
    active_repos: number
    resume_matched_repos: number
    average_code_quality: number
    commit_consistency: number
    collaboration_score: number
    original_projects: number
    forked_projects: number
    project_diversity_score: number
  }
  red_flags: string[]
  positive_indicators: string[]
  technical_score: number
  activity_score: number
  authenticity_score: number
  recommendations: string[]
  chain_of_thought: string[]
  hiring_verdict: {
    recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire'
    confidence: number
    reasoning: string[]
  }
  gemini_insights: {
    ai_detection_confidence: number
    overall_assessment: string
    hiring_recommendation: string
  }
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