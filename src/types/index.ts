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