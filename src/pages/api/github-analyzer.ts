import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { GitHubProfile, Repository, GitHubAnalysis } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GitHubApiResponse {
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
}

interface GitHubRepoResponse {
  id: number
  name: string
  description?: string
  html_url: string
  language?: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  topics?: string[]
  size: number
  open_issues_count: number
}

async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'JobHatch-HR-Analyzer'
    }
  })

  if (!response.ok) {
    throw new Error(`GitHub user ${username} not found`)
  }

  const data: GitHubApiResponse = await response.json()
  
  return {
    login: data.login,
    name: data.name || data.login,
    bio: data.bio || undefined,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    public_repos: data.public_repos,
    followers: data.followers,
    following: data.following
  }
}

async function fetchGitHubRepositories(username: string): Promise<Repository[]> {
  const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'JobHatch-HR-Analyzer'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch repositories for ${username}`)
  }

  const data: GitHubRepoResponse[] = await response.json()
  
  return data.map(repo => ({
    id: repo.id,
    name: repo.name,
    description: repo.description || undefined,
    html_url: repo.html_url,
    language: repo.language || undefined,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    updated_at: repo.updated_at
  }))
}

async function analyzeGitHubProfile(profile: GitHubProfile, repositories: Repository[], jobSkills: string[]): Promise<GitHubAnalysis> {
  const relevantRepos = repositories
    .filter(repo => repo.description || repo.language)
    .slice(0, 10) // Analyze top 10 most recent repos

  const prompt = `
Analyze this GitHub profile for a job candidate applying for a position requiring these skills: ${jobSkills.join(', ')}

GitHub Profile:
- Username: ${profile.login}
- Name: ${profile.name}
- Bio: ${profile.bio || 'No bio'}
- Public Repos: ${profile.public_repos}
- Followers: ${profile.followers}

Recent Repositories:
${relevantRepos.map(repo => `
- ${repo.name} (${repo.language || 'No language'})
  Description: ${repo.description || 'No description'}
  Stars: ${repo.stargazers_count}, Forks: ${repo.forks_count}
  URL: ${repo.html_url}
`).join('')}

Provide analysis in this JSON format:
{
  "technicalScore": 85,
  "activityScore": 75,
  "codeQualityIndicators": ["indicator1", "indicator2"],
  "skillsEvidence": ["evidence1", "evidence2"],
  "projectHighlights": ["highlight1", "highlight2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Score from 0-100 based on:
- Technical skills alignment with job requirements
- Code quality indicators (repo structure, documentation, etc.)
- Activity level and contribution patterns
- Project diversity and complexity
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a senior technical recruiter analyzing GitHub profiles. Provide objective analysis focusing on technical skills, code quality, and professional development.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
    const analysis = JSON.parse(cleanedResponse)

    return {
      username: profile.login,
      profile,
      relevantRepositories: relevantRepos,
      technicalScore: Math.min(100, Math.max(0, Number(analysis.technicalScore) || 0)),
      activityScore: Math.min(100, Math.max(0, Number(analysis.activityScore) || 0)),
      codeQualityIndicators: Array.isArray(analysis.codeQualityIndicators) ? analysis.codeQualityIndicators : []
    }
  } catch (error) {
    console.error('GitHub analysis failed:', error)
    // Fallback analysis
    return {
      username: profile.login,
      profile,
      relevantRepositories: relevantRepos,
      technicalScore: 50,
      activityScore: profile.public_repos > 5 ? 70 : 40,
      codeQualityIndicators: ['Basic GitHub usage detected']
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, jobSkills = [] } = req.body

    if (!username) {
      return res.status(400).json({ error: 'GitHub username is required' })
    }

    // Fetch GitHub profile
    const profile = await fetchGitHubProfile(username)
    
    // Fetch repositories
    const repositories = await fetchGitHubRepositories(username)
    
    // Analyze the profile
    const analysis = await analyzeGitHubProfile(profile, repositories, jobSkills)

    res.status(200).json({
      success: true,
      analysis,
      apiStatus: 'working'
    })

  } catch (error: any) {
    console.error('GitHub analyzer error:', error)
    
    res.status(500).json({
      error: 'Failed to analyze GitHub profile',
      details: error.message,
      apiStatus: 'error'
    })
  }
} 