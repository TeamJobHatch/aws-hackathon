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
} 