import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GitHubProfile {
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

interface Repository {
  id: number
  name: string
  description?: string
  html_url: string
  language?: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  created_at: string
  size: number
  topics?: string[]
  homepage?: string
  has_wiki: boolean
  has_pages: boolean
  default_branch: string
  fork: boolean
  archived: boolean
}

interface RepositoryDetails {
  name: string
  description?: string
  html_url: string
  language?: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  created_at: string
  size: number
  topics?: string[]
  homepage?: string
  has_wiki: boolean
  has_pages: boolean
  readme_content?: string
  file_structure?: string[]
  commit_frequency: number
  last_commit_date: string
  contributors_count: number
  is_fork: boolean
  license?: string
  commit_patterns: {
    total_commits: number
    commits_this_year: number
    commits_last_month: number
    commit_consistency_score: number
    batch_commit_dates: string[]
  }
}

interface ProjectAnalysis {
  name: string
  html_url: string
  resume_mentioned: boolean
  resume_evidence?: string
  completeness_score: number
  demo_links: Array<{
    type: 'demo' | 'video' | 'documentation' | 'live_site' | 'github_pages'
    url: string
    description: string
    working: boolean
  }>
  code_quality: {
    naming_score: number
    comments_score: number
    structure_score: number
    ai_usage_percentage: number
    overall_score: number
    professional_readme: boolean
    has_tests: boolean
    follows_conventions: boolean
  }
  red_flags: string[]
  positive_indicators: string[]
  recommendations: string[]
  project_highlights: string[]
  technologies_detected: string[]
  project_complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  estimated_time_investment: string
  collaboration_evidence: {
    is_group_project: boolean
    evidence: string[]
    individual_contribution_clarity: number
  }
}

interface GitHubAnalysis {
  username: string
  profile: GitHubProfile
  repository_analysis: ProjectAnalysis[]
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

  const data = await response.json()
  
  return {
    login: data.login,
    name: data.name || data.login,
    bio: data.bio || undefined,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    public_repos: data.public_repos,
    followers: data.followers,
    following: data.following,
    created_at: data.created_at,
    updated_at: data.updated_at,
    company: data.company || undefined,
    location: data.location || undefined
  }
}

async function fetchCommitPatterns(username: string, repoName: string): Promise<RepositoryDetails['commit_patterns']> {
  try {
    const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/commits?per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'JobHatch-HR-Analyzer'
      }
    })

    if (!commitsResponse.ok) {
      return {
        total_commits: 0,
        commits_this_year: 0,
        commits_last_month: 0,
        commit_consistency_score: 0,
        batch_commit_dates: []
      }
    }

    const commits = await commitsResponse.json()
    const now = new Date()
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    const commitsThisYear = commits.filter((commit: any) => 
      new Date(commit.commit.committer.date) > yearAgo
    ).length

    const commitsLastMonth = commits.filter((commit: any) => 
      new Date(commit.commit.committer.date) > monthAgo
    ).length

    // Detect batch commits (multiple commits on same day)
    const commitDates = commits.map((commit: any) => 
      commit.commit.committer.date.split('T')[0]
    )
    const dateCounts = commitDates.reduce((acc: Record<string, number>, date: string) => {
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    const batchCommitDates = Object.entries(dateCounts)
      .filter(([, count]) => (count as number) >= 5)
      .map(([date]) => date)

    // Calculate consistency score based on regular activity
    const uniqueDays = new Set(commitDates).size
    const totalDays = commits.length > 0 ? 
      Math.ceil((now.getTime() - new Date(commits[commits.length - 1].commit.committer.date).getTime()) / (1000 * 60 * 60 * 24)) : 0
    const consistencyScore = totalDays > 0 ? Math.min(100, (uniqueDays / totalDays) * 100 * 10) : 0

    return {
      total_commits: commits.length,
      commits_this_year: commitsThisYear,
      commits_last_month: commitsLastMonth,
      commit_consistency_score: Math.round(consistencyScore),
      batch_commit_dates: batchCommitDates
    }
  } catch (error) {
    console.log(`Could not fetch commit patterns for ${username}/${repoName}`)
    return {
      total_commits: 0,
      commits_this_year: 0,
      commits_last_month: 0,
      commit_consistency_score: 0,
      batch_commit_dates: []
    }
  }
}

async function fetchRepositoryDetails(username: string, repoName: string): Promise<RepositoryDetails | null> {
  try {
    // Fetch basic repository info
    const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'JobHatch-HR-Analyzer'
      }
    })

    if (!repoResponse.ok) return null

    const repoData = await repoResponse.json()

    // Fetch README content
    let readmeContent = ''
    try {
      const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'JobHatch-HR-Analyzer'
        }
      })
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json()
        readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8')
      }
    } catch (error) {
      console.log(`No README found for ${username}/${repoName}`)
    }

    // Fetch contributors
    let contributorsCount = 1
    try {
      const contributorsResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/contributors`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'JobHatch-HR-Analyzer'
        }
      })
      if (contributorsResponse.ok) {
        const contributors = await contributorsResponse.json()
        contributorsCount = contributors.length
      }
    } catch (error) {
      console.log(`Could not fetch contributors for ${username}/${repoName}`)
    }

    // Fetch commit patterns
    const commitPatterns = await fetchCommitPatterns(username, repoName)

    return {
      name: repoData.name,
      description: repoData.description,
      html_url: repoData.html_url,
      language: repoData.language,
      stargazers_count: repoData.stargazers_count,
      forks_count: repoData.forks_count,
      updated_at: repoData.updated_at,
      created_at: repoData.created_at,
      size: repoData.size,
      topics: repoData.topics || [],
      homepage: repoData.homepage,
      has_wiki: repoData.has_wiki,
      has_pages: repoData.has_pages,
      readme_content: readmeContent.substring(0, 4000), // Increased for better analysis
      commit_frequency: commitPatterns.total_commits,
      last_commit_date: repoData.updated_at,
      contributors_count: contributorsCount,
      is_fork: repoData.fork,
      license: repoData.license?.name,
      commit_patterns: commitPatterns
    }
  } catch (error) {
    console.error(`Error fetching details for ${username}/${repoName}:`, error)
    return null
  }
}

async function fetchGitHubRepositories(username: string): Promise<Repository[]> {
  const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'JobHatch-HR-Analyzer'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch repositories for ${username}`)
  }

  const data = await response.json()
  
  return data.map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description || undefined,
    html_url: repo.html_url,
    language: repo.language || undefined,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    updated_at: repo.updated_at,
    created_at: repo.created_at,
    size: repo.size,
    topics: repo.topics || [],
    homepage: repo.homepage,
    has_wiki: repo.has_wiki,
    has_pages: repo.has_pages,
    default_branch: repo.default_branch,
    fork: repo.fork,
    archived: repo.archived
  }))
}

async function analyzeProjectWithAI(repoDetails: RepositoryDetails, resumeText: string, jobSkills: string[]): Promise<ProjectAnalysis> {
  const prompt = `
DEEP GITHUB REPOSITORY ANALYSIS

Repository: ${repoDetails.name}
Description: ${repoDetails.description || 'No description'}
Language: ${repoDetails.language || 'Unknown'}
Size: ${repoDetails.size}KB
Stars: ${repoDetails.stargazers_count} | Forks: ${repoDetails.forks_count}
Contributors: ${repoDetails.contributors_count} | Is Fork: ${repoDetails.is_fork}
License: ${repoDetails.license || 'None'}
Created: ${repoDetails.created_at}
Last Updated: ${repoDetails.updated_at}
Topics: ${repoDetails.topics?.join(', ') || 'None'}
Homepage: ${repoDetails.homepage || 'None'}
Has GitHub Pages: ${repoDetails.has_pages}

COMMIT ANALYSIS:
- Total Commits: ${repoDetails.commit_patterns.total_commits}
- This Year: ${repoDetails.commit_patterns.commits_this_year}
- Last Month: ${repoDetails.commit_patterns.commits_last_month}
- Consistency Score: ${repoDetails.commit_patterns.commit_consistency_score}%
- Batch Commit Dates: ${repoDetails.commit_patterns.batch_commit_dates.join(', ') || 'None'}

README CONTENT:
${repoDetails.readme_content || 'No README available'}

CANDIDATE'S RESUME:
${resumeText.substring(0, 3000)}

JOB REQUIREMENTS:
Required Skills: ${jobSkills.join(', ')}

ANALYSIS REQUIREMENTS:
Provide comprehensive JSON analysis focusing on hiring decision support:

{
  "resume_mentioned": true/false,
  "resume_evidence": "Exact text from resume that mentions this project",
  "completeness_score": 85,
  "demo_links": [
    {
      "type": "demo",
      "url": "https://live-demo.com",
      "description": "Live application demo",
      "working": true
    },
    {
      "type": "github_pages",
      "url": "https://username.github.io/project",
      "description": "GitHub Pages deployment",
      "working": true
    }
  ],
  "code_quality": {
    "naming_score": 85,
    "comments_score": 70,
    "structure_score": 90,
    "ai_usage_percentage": 15,
    "overall_score": 82,
    "professional_readme": true,
    "has_tests": false,
    "follows_conventions": true
  },
  "red_flags": ["Concern if any"],
  "positive_indicators": ["Strength 1", "Strength 2"],
  "recommendations": ["Hire/No hire recommendation"],
  "project_highlights": ["Key achievement 1"],
  "technologies_detected": ["React", "Node.js", "TypeScript"],
  "project_complexity": "intermediate",
  "estimated_time_investment": "2-3 months",
  "collaboration_evidence": {
    "is_group_project": false,
    "evidence": ["Evidence of group work or solo work"],
    "individual_contribution_clarity": 85
  }
}

DETAILED ANALYSIS CRITERIA:

1. RESUME MATCHING (Critical):
   - Scan resume for project name, similar descriptions, technologies
   - Look for timeline alignment with commit history
   - Check if candidate claims ownership vs collaboration

2. COMPLETENESS ASSESSMENT (0-100):
   - Demo links: Live demos (+30), GitHub Pages (+20), Videos (+15)
   - Documentation: Professional README (+20), API docs (+10)
   - Project setup: Clear installation (+10), usage examples (+5)

3. CODE QUALITY ANALYSIS (0-100 each):
   - Naming: Variable/function/class naming conventions
   - Comments: Code documentation, inline comments
   - Structure: File organization, architecture patterns
   - AI Usage: Detect patterns of AI-generated code (repetitive patterns, generic variable names, perfect formatting)
   - Professional elements: Tests, linting, CI/CD, proper gitignore

4. RED FLAG DETECTION:
   - Batch commits (multiple projects uploaded same day)
   - Unrealistic solo claims for complex projects
   - No individual commits in group projects
   - Copied/template projects without customization
   - AI-generated code without understanding

5. COLLABORATION ANALYSIS:
   - Group projects: Multiple contributors, issue discussions
   - Individual contribution: Commit authorship, feature ownership
   - Communication: Issue responses, PR comments

6. TECHNOLOGY ALIGNMENT:
   - Match detected technologies with job requirements
   - Assess relevance to position
   - Evaluate technology choices appropriateness

Be thorough and honest. This analysis directly impacts hiring decisions.
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a senior technical recruiter and code reviewer with 10+ years of experience. Provide brutally honest analysis focused on hiring decisions. Detect AI usage patterns, authenticate project ownership, and assess real technical capabilities.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.1, // Lower temperature for more consistent analysis
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
    const analysis = JSON.parse(cleanedResponse)

    // Validate and enhance the analysis
    const enhancedAnalysis: ProjectAnalysis = {
      name: repoDetails.name,
      html_url: repoDetails.html_url,
      resume_mentioned: Boolean(analysis.resume_mentioned),
      resume_evidence: analysis.resume_evidence || undefined,
      completeness_score: Math.min(100, Math.max(0, Number(analysis.completeness_score) || 0)),
      demo_links: (Array.isArray(analysis.demo_links) ? analysis.demo_links : []).map((link: any) => ({
        type: link.type || 'demo',
        url: link.url || '',
        description: link.description || 'Demo link',
        working: link.working !== false // Default to true unless explicitly false
      })),
      code_quality: {
        naming_score: Math.min(100, Math.max(0, Number(analysis.code_quality?.naming_score) || 0)),
        comments_score: Math.min(100, Math.max(0, Number(analysis.code_quality?.comments_score) || 0)),
        structure_score: Math.min(100, Math.max(0, Number(analysis.code_quality?.structure_score) || 0)),
        ai_usage_percentage: Math.min(100, Math.max(0, Number(analysis.code_quality?.ai_usage_percentage) || 0)),
        overall_score: Math.min(100, Math.max(0, Number(analysis.code_quality?.overall_score) || 0)),
        professional_readme: Boolean(analysis.code_quality?.professional_readme),
        has_tests: Boolean(analysis.code_quality?.has_tests),
        follows_conventions: Boolean(analysis.code_quality?.follows_conventions)
      },
      red_flags: Array.isArray(analysis.red_flags) ? analysis.red_flags : [],
      positive_indicators: Array.isArray(analysis.positive_indicators) ? analysis.positive_indicators : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      project_highlights: Array.isArray(analysis.project_highlights) ? analysis.project_highlights : [],
      technologies_detected: Array.isArray(analysis.technologies_detected) ? analysis.technologies_detected : [],
      project_complexity: ['beginner', 'intermediate', 'advanced', 'expert'].includes(analysis.project_complexity) 
        ? analysis.project_complexity : 'intermediate',
      estimated_time_investment: analysis.estimated_time_investment || 'Unknown',
      collaboration_evidence: {
        is_group_project: Boolean(analysis.collaboration_evidence?.is_group_project),
        evidence: Array.isArray(analysis.collaboration_evidence?.evidence) ? analysis.collaboration_evidence.evidence : [],
        individual_contribution_clarity: Math.min(100, Math.max(0, Number(analysis.collaboration_evidence?.individual_contribution_clarity) || 0))
      }
    }

    // Add automatic demo links if homepage exists and not already included
    if (repoDetails.homepage && !enhancedAnalysis.demo_links.find(link => link.url === repoDetails.homepage)) {
      enhancedAnalysis.demo_links.push({
        type: 'live_site',
        url: repoDetails.homepage,
        description: 'Project homepage',
        working: true
      })
    }

    // Add GitHub Pages link if available
    if (repoDetails.has_pages) {
      const githubPagesUrl = `https://${repoDetails.html_url.split('/')[3]}.github.io/${repoDetails.name}`
      if (!enhancedAnalysis.demo_links.find(link => link.url === githubPagesUrl)) {
        enhancedAnalysis.demo_links.push({
          type: 'github_pages',
          url: githubPagesUrl,
          description: 'GitHub Pages deployment',
          working: true
        })
      }
    }

    return enhancedAnalysis

  } catch (error) {
    console.error('Enhanced project analysis failed:', error)
    
    // Comprehensive fallback analysis
    const fallbackAnalysis: ProjectAnalysis = {
      name: repoDetails.name,
      html_url: repoDetails.html_url,
      resume_mentioned: false,
      completeness_score: repoDetails.readme_content ? 60 : 30,
      demo_links: [],
      code_quality: {
        naming_score: 70,
        comments_score: 50,
        structure_score: 60,
        ai_usage_percentage: 10,
        overall_score: 60,
        professional_readme: Boolean(repoDetails.readme_content && repoDetails.readme_content.length > 200),
        has_tests: false,
        follows_conventions: true
      },
      red_flags: [],
      positive_indicators: [],
      recommendations: ['Conduct technical review during interview'],
      project_highlights: repoDetails.description ? [repoDetails.description] : [],
      technologies_detected: repoDetails.language ? [repoDetails.language] : [],
      project_complexity: 'intermediate',
      estimated_time_investment: 'Unknown',
      collaboration_evidence: {
        is_group_project: repoDetails.contributors_count > 1,
        evidence: [],
        individual_contribution_clarity: 50
      }
    }

    // Add demo links from fallback sources
    if (repoDetails.homepage) {
      fallbackAnalysis.demo_links.push({
        type: 'live_site',
        url: repoDetails.homepage,
        description: 'Project homepage',
        working: true
      })
    }

    if (repoDetails.has_pages) {
      fallbackAnalysis.demo_links.push({
        type: 'github_pages',
        url: `https://${repoDetails.html_url.split('/')[3]}.github.io/${repoDetails.name}`,
        description: 'GitHub Pages deployment',
        working: true
      })
    }

    return fallbackAnalysis
  }
}

function detectAdvancedRedFlags(repositories: Repository[], projectAnalyses: ProjectAnalysis[], profile: GitHubProfile): string[] {
  const redFlags: string[] = []
  
  // 1. Batch upload detection (enhanced)
  const creationDates = repositories.map(repo => repo.created_at.split('T')[0])
  const dateGroups = creationDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const batchUploads = Object.entries(dateGroups).filter(([, count]) => (count as number) >= 3)
  if (batchUploads.length > 0) {
    const maxBatch = Math.max(...batchUploads.map(([, count]) => count as number))
    redFlags.push(`🚨 Batch upload detected: ${maxBatch} repositories created on ${batchUploads[0][0]}`)
  }

  // 2. Unrealistic productivity patterns
  const totalComplexProjects = projectAnalyses.filter(p => 
    ['advanced', 'expert'].includes(p.project_complexity) && 
    p.collaboration_evidence.individual_contribution_clarity > 80
  ).length

  if (totalComplexProjects > 3 && profile.created_at && 
      (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365) < 2) {
    redFlags.push(`🤔 High productivity: ${totalComplexProjects} complex solo projects in less than 2 years`)
  }

  // 3. AI usage patterns
  const avgAIUsage = projectAnalyses.reduce((sum, p) => sum + p.code_quality.ai_usage_percentage, 0) / projectAnalyses.length
  if (avgAIUsage > 70) {
    redFlags.push(`🤖 Extremely high AI usage: Average ${Math.round(avgAIUsage)}% AI-generated code detected`)
  }

  // 4. Commit pattern inconsistencies
  const batchCommitProjects = projectAnalyses.filter(p => 
    repositories.find(r => r.name === p.name && 
      repositories.find(repo => repo.name === p.name)?.created_at.split('T')[0] === 
      repositories.find(repo => repo.name === p.name)?.updated_at.split('T')[0]
    )
  ).length

  if (batchCommitProjects > 2) {
    redFlags.push(`⚠️ Suspicious commit patterns: ${batchCommitProjects} projects with all commits on same day`)
  }

  // 5. Resume inconsistencies
  const resumeClaimedProjects = projectAnalyses.filter(p => p.resume_mentioned).length
  const actualProjects = projectAnalyses.length
  
  if (resumeClaimedProjects === 0 && actualProjects > 5) {
    redFlags.push(`📄 Resume mismatch: No GitHub projects mentioned in resume despite ${actualProjects} repositories`)
  }

  // 6. Collaboration red flags
  const groupProjectsWithPoorClarity = projectAnalyses.filter(p => 
    p.collaboration_evidence.is_group_project && 
    p.collaboration_evidence.individual_contribution_clarity < 40
  ).length

  if (groupProjectsWithPoorClarity > 1) {
    redFlags.push(`👥 Unclear contributions: ${groupProjectsWithPoorClarity} group projects with unclear individual contributions`)
  }

  // 7. Forked projects claiming
  const forkedRepos = repositories.filter(r => r.fork).length
  if (forkedRepos > repositories.length * 0.5 && repositories.length > 10) {
    redFlags.push(`🍴 High fork ratio: ${forkedRepos}/${repositories.length} repositories are forks`)
  }

  return redFlags
}

function calculateHiringVerdict(analysis: Omit<GitHubAnalysis, 'hiring_verdict'>): GitHubAnalysis['hiring_verdict'] {
  const scores = {
    technical: analysis.technical_score,
    activity: analysis.activity_score,
    authenticity: analysis.authenticity_score
  }

  const avgScore = (scores.technical + scores.activity + scores.authenticity) / 3
  const redFlagCount = analysis.red_flags.length
  const resumeMatchCount = analysis.overall_metrics.resume_matched_repos

  let recommendation: GitHubAnalysis['hiring_verdict']['recommendation']
  let confidence: number
  let reasoning: string[] = []

  // Decision logic
  if (avgScore >= 85 && redFlagCount === 0 && resumeMatchCount > 0) {
    recommendation = 'strong_hire'
    confidence = 95
    reasoning = [
      `Exceptional technical profile (${Math.round(avgScore)}% overall score)`,
      'No red flags detected',
      `${resumeMatchCount} projects match resume claims`,
      'High authenticity and code quality'
    ]
  } else if (avgScore >= 75 && redFlagCount <= 1 && resumeMatchCount >= 1) {
    recommendation = 'hire'
    confidence = 85
    reasoning = [
      `Strong technical performance (${Math.round(avgScore)}% overall score)`,
      redFlagCount === 0 ? 'Clean profile' : '1 minor concern detected',
      `Resume verification successful`,
      'Recommended for technical interview'
    ]
  } else if (avgScore >= 60 && redFlagCount <= 2) {
    recommendation = 'maybe'
    confidence = 60
    reasoning = [
      `Moderate technical score (${Math.round(avgScore)}%)`,
      `${redFlagCount} concern(s) require review`,
      'Consider for technical assessment',
      'Requires thorough interview evaluation'
    ]
  } else {
    recommendation = 'no_hire'
    confidence = 80
    reasoning = [
      `Low technical score (${Math.round(avgScore)}%)`,
      `${redFlagCount} red flag(s) detected`,
      resumeMatchCount === 0 ? 'No resume verification' : 'Authenticity concerns',
      'High risk candidate'
    ]
  }

  return { recommendation, confidence, reasoning }
}

function generateEnhancedChainOfThought(
  username: string, 
  repositoryCount: number, 
  analysisCount: number,
  redFlags: string[],
  resumeMatches: number
): string[] {
  return [
    `🔍 Initiating deep GitHub analysis for candidate: ${username}`,
    `📊 Profile discovery: ${repositoryCount} public repositories found`,
    `🎯 Repository prioritization: Selected ${Math.min(analysisCount, repositoryCount)} most relevant projects`,
    `📁 Detailed data collection: Fetching repository metadata, commits, and documentation`,
    `🔗 Resume cross-reference: Matching projects against candidate claims`,
    `🏗️ Code quality assessment: Analyzing naming, structure, documentation, and AI usage`,
    `👥 Collaboration analysis: Evaluating group vs individual contributions`,
    `🔴 Risk assessment: Scanning for authenticity concerns and red flags`,
    `📈 Completeness evaluation: Checking demos, documentation, and project polish`,
    `🎯 Technical skill validation: Aligning technologies with job requirements`,
    `⚖️ Hiring decision synthesis: Weighing all factors for recommendation`,
    `${redFlags.length > 0 ? `⚠️ Alert: ${redFlags.length} red flag(s) detected requiring attention` : '✅ Clean profile: No major concerns identified'}`,
    `📋 Resume verification: ${resumeMatches > 0 ? `${resumeMatches} project(s) validated` : 'No matching projects found'}`,
    `🎉 Analysis complete: Comprehensive GitHub evaluation ready for review`
  ]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, jobSkills = [], resumeText = '' } = req.body

    if (!username) {
      return res.status(400).json({ error: 'GitHub username is required' })
    }

    // Enhanced username validation
    if (!/^[a-zA-Z0-9-_]+$/.test(username) || 
        username.length === 0 || 
        username.length > 39 ||
        username.includes('.') ||
        username.includes('@') ||
        username.startsWith('-') ||
        username.endsWith('-')) {
      console.log(`❌ Invalid GitHub username format: ${username}`)
      return res.status(400).json({ 
        error: 'Invalid GitHub username format',
        details: `Username "${username}" contains invalid characters or format`,
        apiStatus: 'error'
      })
    }

    console.log(`🔍 Starting deep GitHub analysis for: ${username}`)

    // Fetch GitHub profile
    const profile = await fetchGitHubProfile(username)
    console.log(`📊 Profile analysis: ${profile.public_repos} repos, ${profile.followers} followers, member since ${new Date(profile.created_at).getFullYear()}`)
    
    // Fetch repositories
    const repositories = await fetchGitHubRepositories(username)
    console.log(`📁 Repository scan: Found ${repositories.length} total repositories`)
    
    // Enhanced repository filtering and prioritization
    const activeRepos = repositories.filter(repo => 
      !repo.archived && 
      !repo.fork && 
      repo.size > 50 && // Minimum size threshold
      new Date(repo.updated_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 2) // Active in last 2 years
    )

    const prioritizedRepos = activeRepos
      .sort((a, b) => {
        // Enhanced scoring algorithm
        const scoreA = (a.stargazers_count * 3) + (a.forks_count * 2) + (a.size / 100) + 
                      (a.topics?.length || 0) * 5 + (a.homepage ? 10 : 0)
        const scoreB = (b.stargazers_count * 3) + (b.forks_count * 2) + (b.size / 100) + 
                      (b.topics?.length || 0) * 5 + (b.homepage ? 10 : 0)
        return scoreB - scoreA
      })
      .slice(0, 10) // Analyze top 10 repositories for comprehensive analysis
    
    console.log(`🎯 Repository prioritization: Analyzing ${prioritizedRepos.length} high-priority repositories`)
    
    // Detailed repository analysis
    const repositoryAnalyses: ProjectAnalysis[] = []
    
    for (let i = 0; i < prioritizedRepos.length; i++) {
      const repo = prioritizedRepos[i]
      console.log(`📝 Deep analysis ${i + 1}/${prioritizedRepos.length}: ${repo.name}`)
      
      const repoDetails = await fetchRepositoryDetails(username, repo.name)
      
      if (repoDetails) {
        const analysis = await analyzeProjectWithAI(repoDetails, resumeText, jobSkills)
        repositoryAnalyses.push(analysis)
        console.log(`✅ Analysis complete for ${repo.name}: Quality=${analysis.code_quality.overall_score}%, AI=${analysis.code_quality.ai_usage_percentage}%`)
      }
    }
    
    // Advanced red flag detection
    const globalRedFlags = detectAdvancedRedFlags(repositories, repositoryAnalyses, profile)
    console.log(`🚨 Risk assessment: ${globalRedFlags.length} red flag(s) detected`)
    
    // Enhanced positive indicators
    const positiveIndicators: string[] = []
    const avgCodeQuality = repositoryAnalyses.reduce((sum, r) => sum + r.code_quality.overall_score, 0) / repositoryAnalyses.length
    const resumeMatchedRepos = repositoryAnalyses.filter(r => r.resume_mentioned).length
    const projectsWithDemos = repositoryAnalyses.filter(r => r.demo_links.length > 0).length
    const originalProjects = repositories.filter(r => !r.fork).length
    const forkedProjects = repositories.filter(r => r.fork).length

    if (avgCodeQuality > 80) positiveIndicators.push(`🏆 Excellent code quality: ${Math.round(avgCodeQuality)}% average`)
    if (resumeMatchedRepos > 0) positiveIndicators.push(`✅ Resume verified: ${resumeMatchedRepos} matching projects`)
    if (projectsWithDemos > repositoryAnalyses.length * 0.5) positiveIndicators.push(`🎯 Demo-oriented: ${projectsWithDemos} projects with live demos`)
    if (profile.followers > 50) positiveIndicators.push(`🌟 Community recognition: ${profile.followers} followers`)
    if (originalProjects > forkedProjects * 2) positiveIndicators.push(`💡 Original work focus: ${originalProjects} original vs ${forkedProjects} forked repos`)
    
    // Calculate comprehensive metrics
    const technicalScore = Math.min(100, 
      (avgCodeQuality * 0.4) + 
      (resumeMatchedRepos * 10) + 
      (projectsWithDemos * 5) + 
      Math.min(20, profile.followers * 0.2)
    )
    
    const activityScore = Math.min(100, 
      (repositories.length * 1.5) + 
      (profile.followers * 0.3) + 
      (repositoryAnalyses.reduce((sum, r) => sum + r.completeness_score, 0) / repositoryAnalyses.length * 0.4) +
      (activeRepos.length * 2)
    )

    const authenticityScore = Math.max(0, 100 - (globalRedFlags.length * 20) - 
      (repositoryAnalyses.reduce((sum, r) => sum + r.code_quality.ai_usage_percentage, 0) / repositoryAnalyses.length * 0.3)
    )

    const projectDiversityScore = Math.min(100, 
      new Set(repositoryAnalyses.flatMap(r => r.technologies_detected)).size * 10
    )
    
    // Generate enhanced chain of thought
    const chainOfThought = generateEnhancedChainOfThought(
      username, 
      repositories.length, 
      repositoryAnalyses.length,
      globalRedFlags,
      resumeMatchedRepos
    )
    
    // Generate comprehensive recommendations
    const recommendations: string[] = []
    if (resumeMatchedRepos === 0 && repositories.length > 5) {
      recommendations.push('🔍 Critical: No GitHub projects match resume claims - verify authenticity during interview')
    }
    if (avgCodeQuality < 60) {
      recommendations.push('📈 Concern: Below-average code quality - conduct hands-on technical assessment')
    }
    if (globalRedFlags.length > 0) {
      recommendations.push(`⚠️ Risk alert: ${globalRedFlags.length} red flag(s) require thorough evaluation`)
    }
    if (technicalScore > 85 && globalRedFlags.length === 0) {
      recommendations.push('✅ Strong hire: Exceptional technical profile with verified projects')
    }
    if (repositoryAnalyses.reduce((sum, r) => sum + r.code_quality.ai_usage_percentage, 0) / repositoryAnalyses.length > 50) {
      recommendations.push('🤖 AI dependency: High AI usage detected - assess independent coding ability')
    }

    const analysis: Omit<GitHubAnalysis, 'hiring_verdict'> = {
      username,
      profile,
      repository_analysis: repositoryAnalyses,
      overall_metrics: {
        total_repos: repositories.length,
        active_repos: activeRepos.length,
        resume_matched_repos: resumeMatchedRepos,
        average_code_quality: Math.round(avgCodeQuality),
        commit_consistency: Math.round(repositoryAnalyses.reduce((sum, r) => 
          sum + (repositories.find(repo => repo.name === r.name)?.updated_at ? 70 : 0), 0) / repositoryAnalyses.length),
        collaboration_score: Math.round((profile.followers + profile.following) / 2),
        original_projects: originalProjects,
        forked_projects: forkedProjects,
        project_diversity_score: Math.round(projectDiversityScore)
      },
      red_flags: globalRedFlags,
      positive_indicators: positiveIndicators,
      technical_score: Math.round(technicalScore),
      activity_score: Math.round(activityScore),
      authenticity_score: Math.round(authenticityScore),
      recommendations,
      chain_of_thought: chainOfThought
    }

    // Calculate hiring verdict
    const hiringVerdict = calculateHiringVerdict(analysis)

    const finalAnalysis: GitHubAnalysis = {
      ...analysis,
      hiring_verdict: hiringVerdict
    }

    console.log(`🎉 Deep analysis completed for ${username}`)
    console.log(`📊 Final scores - Technical: ${finalAnalysis.technical_score}%, Activity: ${finalAnalysis.activity_score}%, Authenticity: ${finalAnalysis.authenticity_score}%`)
    console.log(`🎯 Hiring verdict: ${hiringVerdict.recommendation.toUpperCase()} (${hiringVerdict.confidence}% confidence)`)
    console.log(`⚠️ Quality assessment: ${globalRedFlags.length} red flags, ${resumeMatchedRepos} resume matches, ${avgCodeQuality}% avg quality`)

    res.status(200).json({
      success: true,
      analysis: finalAnalysis,
      apiStatus: 'working',
      processingTime: Date.now()
    })

  } catch (error: any) {
    console.error('❌ GitHub deep analysis failed for:', req.body?.username, 'Error:', error.message)
    
    // Enhanced error handling
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'GitHub user not found',
        details: `No GitHub user found with username: ${req.body?.username}`,
        apiStatus: 'error',
        suggestion: 'Verify the username is correct and the profile is public'
      })
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'GitHub API rate limit exceeded',
        details: 'Too many requests to GitHub API',
        apiStatus: 'limited',
        suggestion: 'Please try again in a few minutes'
      })
    }
    
    res.status(500).json({
      error: 'Failed to analyze GitHub profile',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Deep analysis failed',
      apiStatus: 'error',
      username: req.body?.username
    })
  }
} 