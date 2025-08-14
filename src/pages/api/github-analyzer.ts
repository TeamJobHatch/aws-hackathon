import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

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
    hiring_impact: 'positive' | 'neutral' | 'negative'
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
    gemini_confidence: number
  }
  red_flags: Array<{
    type: 'critical' | 'moderate' | 'minor'
    description: string
    evidence: string
    hiring_impact: 'negative' | 'caution'
  }>
  positive_indicators: Array<{
    type: 'technical' | 'professional' | 'collaboration'
    description: string
    evidence: string
    hiring_impact: 'positive' | 'strong_positive'
  }>
  recommendations: Array<{
    action: string
    priority: 'high' | 'medium' | 'low'
    hiring_impact: 'positive' | 'negative' | 'neutral'
  }>
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
  gemini_insights: {
    ai_detection_confidence: number
    overall_assessment: string
    hiring_recommendation: string
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
      readme_content: readmeContent.substring(0, 4000),
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

async function analyzeProjectWithGemini(repoDetails: RepositoryDetails, resumeText: string, jobSkills: string[]): Promise<ProjectAnalysis> {
  if (!genAI) {
    throw new Error('Gemini API not configured')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `
🔍 ENHANCED GITHUB REPOSITORY ANALYSIS (Powered by Gemini 2.5 Flash)

You are a world-class senior technical recruiter with 15+ years of experience analyzing GitHub repositories for Fortune 500 companies. Your analysis directly impacts hiring decisions worth millions in salary and recruitment costs. Provide brutally honest, data-driven assessment with specific hiring impact indicators.

ANALYSIS MANDATE: Be thorough, specific, and actionable. Focus on technical competency, code authenticity, and hiring risk assessment.

📊 REPOSITORY DATA:
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

🔢 COMMIT PATTERNS:
- Total Commits: ${repoDetails.commit_patterns.total_commits}
- This Year: ${repoDetails.commit_patterns.commits_this_year}
- Last Month: ${repoDetails.commit_patterns.commits_last_month}
- Consistency Score: ${repoDetails.commit_patterns.commit_consistency_score}%
- Batch Commit Dates: ${repoDetails.commit_patterns.batch_commit_dates.join(', ') || 'None'}

📖 README CONTENT:
${repoDetails.readme_content || 'No README available'}

👤 CANDIDATE'S RESUME:
${resumeText.substring(0, 3000)}

🎯 JOB REQUIREMENTS:
Required Skills: ${jobSkills.join(', ')}

🎯 ANALYSIS REQUIREMENTS:
Return comprehensive JSON analysis focusing on HIRING IMPACT:

{
  "resume_mentioned": true/false,
  "resume_evidence": "Exact quote from resume mentioning this project",
  "completeness_score": 85,
  "demo_links": [
    {
      "type": "live_site",
      "url": "https://example.com",
      "description": "Production deployment",
      "working": true,
      "hiring_impact": "positive"
    }
  ],
  "code_quality": {
    "naming_score": 85,
    "comments_score": 70,
    "structure_score": 90,
    "ai_usage_percentage": 25,
    "overall_score": 82,
    "professional_readme": true,
    "has_tests": false,
    "follows_conventions": true,
    "gemini_confidence": 90
  },
  "red_flags": [
    {
      "type": "critical",
      "description": "All commits made on same day as creation",
      "evidence": "Repository created and finished in 1 day with 50+ commits",
      "hiring_impact": "negative"
    }
  ],
  "positive_indicators": [
    {
      "type": "technical",
      "description": "Well-structured codebase with clear separation of concerns",
      "evidence": "Multiple modules, clean imports, consistent naming",
      "hiring_impact": "positive"
    }
  ],
  "recommendations": [
    {
      "action": "Ask about project development timeline during interview",
      "priority": "high",
      "hiring_impact": "neutral"
    }
  ],
  "project_highlights": ["Implements complex algorithm", "Production-ready"],
  "technologies_detected": ["React", "TypeScript", "Node.js"],
  "project_complexity": "intermediate",
  "estimated_time_investment": "2-3 months",
  "collaboration_evidence": {
    "is_group_project": false,
    "evidence": ["Solo commits", "Single author in README"],
    "individual_contribution_clarity": 100,
    "hiring_impact": "positive"
  }
}

🔍 CRITICAL ANALYSIS AREAS - ENHANCED FRAMEWORK:

1. TECHNICAL COMPETENCY ASSESSMENT (Weight: 40%):
   - Code architecture and design patterns quality
   - Algorithm complexity and optimization awareness
   - Technology stack appropriateness and modern practices
   - Error handling, testing, and production readiness
   - Performance considerations and scalability awareness

2. AUTHENTICITY & AI USAGE DETECTION (Weight: 30%):
   - AI-generated code indicators: Repetitive patterns, perfect formatting, generic variable names
   - Sudden code quality jumps inconsistent with experience level
   - Copy-paste patterns from tutorials/Stack Overflow without attribution
   - Boilerplate code vs. custom implementation ratio
   - Commit message patterns (AI tools often generate specific formats)
   - PROVIDE SPECIFIC PERCENTAGE ESTIMATE WITH HIGH CONFIDENCE

3. PROJECT COMPLETENESS & PROFESSIONALISM (Weight: 20%):
   - Live demonstrations: Production deployments (+30), GitHub Pages (+20), Video demos (+15)
   - Documentation quality: Professional README (+25), API documentation (+20), Setup instructions (+15)
   - Development practices: Tests (+20), CI/CD (+15), Proper branching (+10), Issue tracking (+10)
   - Code comments and maintainability

4. RESUME VERIFICATION & CONSISTENCY (Weight: 10%):
   - Cross-reference project claims with actual implementation
   - Timeline consistency: Commit patterns vs. claimed development duration
   - Technology claims vs. actual usage in code
   - Solo vs. group project claims verification

5. RED FLAG DETECTION (CRITICAL):
   - Batch commit patterns: Entire project committed in 1-2 days
   - Unrealistic complexity for timeframe
   - Group projects with unclear individual contributions
   - Identical code structures across multiple projects
   - Missing fundamental knowledge in supposed expertise areas

6. POSITIVE INDICATORS (HIRING ADVANTAGES):
   - Original problem-solving approaches and creative solutions
   - Evolutionary development patterns showing iterative improvement
   - Real-world problem solving with practical applications
   - Active maintenance and version updates
   - Community engagement (issues, pull requests, discussions)

7. HIRING IMPACT CLASSIFICATION:
   - "strong_positive": Exceptional technical demonstration, clear hiring advantage
   - "positive": Good technical skills, supports hiring decision
   - "neutral": Basic competency, no significant impact
   - "negative": Concerns identified, may hurt hiring prospects
   - "caution": Serious red flags, requires immediate investigation

ANALYSIS REQUIREMENTS:
- Be specific with evidence and examples
- Quantify findings with percentages and metrics
- Provide actionable recommendations for hiring managers
- Flag any inconsistencies or concerns immediately
- Focus on what this tells us about the candidate's actual capabilities
`

  try {
    // Add timeout for Gemini API call to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Gemini analysis timeout after 30 seconds')), 30000)
    })

    const geminiPromise = model.generateContent(prompt)
    const result = await Promise.race([geminiPromise, timeoutPromise])
    const response = result.response
    const responseText = response.text()

    // Clean and parse the response
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
    let analysis

    try {
      analysis = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError)
      throw new Error('Invalid JSON response from Gemini')
    }

    // Validate and enhance the analysis with proper typing
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
        working: link.working !== false,
        hiring_impact: ['positive', 'neutral', 'negative'].includes(link.hiring_impact) ? link.hiring_impact : 'neutral'
      })),
      code_quality: {
        naming_score: Math.min(100, Math.max(0, Number(analysis.code_quality?.naming_score) || 0)),
        comments_score: Math.min(100, Math.max(0, Number(analysis.code_quality?.comments_score) || 0)),
        structure_score: Math.min(100, Math.max(0, Number(analysis.code_quality?.structure_score) || 0)),
        ai_usage_percentage: Math.min(100, Math.max(0, Number(analysis.code_quality?.ai_usage_percentage) || 0)),
        overall_score: Math.min(100, Math.max(0, Number(analysis.code_quality?.overall_score) || 0)),
        professional_readme: Boolean(analysis.code_quality?.professional_readme),
        has_tests: Boolean(analysis.code_quality?.has_tests),
        follows_conventions: Boolean(analysis.code_quality?.follows_conventions),
        gemini_confidence: Math.min(100, Math.max(0, Number(analysis.code_quality?.gemini_confidence) || 70))
      },
      red_flags: (Array.isArray(analysis.red_flags) ? analysis.red_flags : []).map((flag: any) => ({
        type: ['critical', 'moderate', 'minor'].includes(flag.type) ? flag.type : 'moderate',
        description: flag.description || 'Potential concern detected',
        evidence: flag.evidence || 'Evidence not provided',
        hiring_impact: ['negative', 'caution'].includes(flag.hiring_impact) ? flag.hiring_impact : 'caution'
      })),
      positive_indicators: (Array.isArray(analysis.positive_indicators) ? analysis.positive_indicators : []).map((indicator: any) => ({
        type: ['technical', 'professional', 'collaboration'].includes(indicator.type) ? indicator.type : 'technical',
        description: indicator.description || 'Positive indicator',
        evidence: indicator.evidence || 'Evidence found',
        hiring_impact: ['positive', 'strong_positive'].includes(indicator.hiring_impact) ? indicator.hiring_impact : 'positive'
      })),
      recommendations: (Array.isArray(analysis.recommendations) ? analysis.recommendations : []).map((rec: any) => ({
        action: rec.action || 'Review during interview',
        priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
        hiring_impact: ['positive', 'negative', 'neutral'].includes(rec.hiring_impact) ? rec.hiring_impact : 'neutral'
      })),
      project_highlights: Array.isArray(analysis.project_highlights) ? analysis.project_highlights : [],
      technologies_detected: Array.isArray(analysis.technologies_detected) ? analysis.technologies_detected : [],
      project_complexity: ['beginner', 'intermediate', 'advanced', 'expert'].includes(analysis.project_complexity) 
        ? analysis.project_complexity : 'intermediate',
      estimated_time_investment: analysis.estimated_time_investment || 'Unknown',
      collaboration_evidence: {
        is_group_project: Boolean(analysis.collaboration_evidence?.is_group_project),
        evidence: Array.isArray(analysis.collaboration_evidence?.evidence) ? analysis.collaboration_evidence.evidence : [],
        individual_contribution_clarity: Math.min(100, Math.max(0, Number(analysis.collaboration_evidence?.individual_contribution_clarity) || 0)),
        hiring_impact: ['positive', 'negative', 'neutral'].includes(analysis.collaboration_evidence?.hiring_impact) 
          ? analysis.collaboration_evidence.hiring_impact : 'neutral'
      }
    }

    // Auto-add demo links if missing
    if (repoDetails.homepage && !enhancedAnalysis.demo_links.find(link => link.url === repoDetails.homepage)) {
      enhancedAnalysis.demo_links.push({
        type: 'live_site',
        url: repoDetails.homepage,
        description: 'Project homepage',
        working: true,
        hiring_impact: 'positive'
      })
    }

    if (repoDetails.has_pages) {
      const githubPagesUrl = `https://${repoDetails.html_url.split('/')[3]}.github.io/${repoDetails.name}`
      if (!enhancedAnalysis.demo_links.find(link => link.url === githubPagesUrl)) {
        enhancedAnalysis.demo_links.push({
          type: 'github_pages',
          url: githubPagesUrl,
          description: 'GitHub Pages deployment',
          working: true,
          hiring_impact: 'positive'
        })
      }
    }

    return enhancedAnalysis

  } catch (error) {
    console.error('Gemini project analysis failed:', error)
    
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
        ai_usage_percentage: 20,
        overall_score: 60,
        professional_readme: Boolean(repoDetails.readme_content && repoDetails.readme_content.length > 200),
        has_tests: false,
        follows_conventions: true,
        gemini_confidence: 30
      },
      red_flags: [{
        type: 'minor',
        description: 'Analysis failed - manual review required',
        evidence: 'Gemini analysis could not complete',
        hiring_impact: 'caution'
      }],
      positive_indicators: [],
      recommendations: [{
        action: 'Conduct thorough technical review during interview',
        priority: 'high',
        hiring_impact: 'neutral'
      }],
      project_highlights: repoDetails.description ? [repoDetails.description] : [],
      technologies_detected: repoDetails.language ? [repoDetails.language] : [],
      project_complexity: 'intermediate',
      estimated_time_investment: 'Unknown',
      collaboration_evidence: {
        is_group_project: repoDetails.contributors_count > 1,
        evidence: [],
        individual_contribution_clarity: 50,
        hiring_impact: 'neutral'
      }
    }

    // Add fallback demo links
    if (repoDetails.homepage) {
      fallbackAnalysis.demo_links.push({
        type: 'live_site',
        url: repoDetails.homepage,
        description: 'Project homepage',
        working: true,
        hiring_impact: 'positive'
      })
    }

    if (repoDetails.has_pages) {
      fallbackAnalysis.demo_links.push({
        type: 'github_pages',
        url: `https://${repoDetails.html_url.split('/')[3]}.github.io/${repoDetails.name}`,
        description: 'GitHub Pages deployment',
        working: true,
        hiring_impact: 'positive'
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

  // 2. AI usage patterns from Gemini analysis
  const avgAIUsage = projectAnalyses.reduce((sum, p) => sum + p.code_quality.ai_usage_percentage, 0) / projectAnalyses.length
  if (avgAIUsage > 70) {
    redFlags.push(`🤖 High AI dependency: Average ${Math.round(avgAIUsage)}% AI-generated code detected`)
  }

  // 3. Critical red flags from individual projects
  const criticalRedFlags = projectAnalyses.flatMap(p => p.red_flags.filter(f => f.type === 'critical'))
  if (criticalRedFlags.length > 0) {
    redFlags.push(`⚠️ Critical issues: ${criticalRedFlags.length} major concern(s) across projects`)
  }

  // 4. Resume inconsistencies
  const resumeClaimedProjects = projectAnalyses.filter(p => p.resume_mentioned).length
  const actualProjects = projectAnalyses.length
  
  if (resumeClaimedProjects === 0 && actualProjects > 5) {
    redFlags.push(`📄 Resume mismatch: No GitHub projects mentioned despite ${actualProjects} repositories`)
  }

  // 5. Collaboration red flags
  const groupProjectsWithPoorClarity = projectAnalyses.filter(p => 
    p.collaboration_evidence.is_group_project && 
    p.collaboration_evidence.individual_contribution_clarity < 40
  ).length

  if (groupProjectsWithPoorClarity > 1) {
    redFlags.push(`👥 Unclear contributions: ${groupProjectsWithPoorClarity} group projects with unclear individual work`)
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

  // Enhanced decision logic with Gemini insights
  const avgAIUsage = analysis.repository_analysis.reduce((sum, r) => sum + r.code_quality.ai_usage_percentage, 0) / analysis.repository_analysis.length
  const criticalFlags = analysis.repository_analysis.flatMap(r => r.red_flags.filter(f => f.type === 'critical')).length

  let recommendation: GitHubAnalysis['hiring_verdict']['recommendation']
  let confidence: number
  let reasoning: string[] = []

  if (avgScore >= 85 && redFlagCount === 0 && resumeMatchCount > 0 && avgAIUsage < 30) {
    recommendation = 'strong_hire'
    confidence = 95
    reasoning = [
      `Outstanding technical profile (${Math.round(avgScore)}% overall score)`,
      'No red flags detected',
      `${resumeMatchCount} verified resume projects`,
      `Low AI dependency (${Math.round(avgAIUsage)}%)`
    ]
  } else if (avgScore >= 75 && criticalFlags === 0 && avgAIUsage < 50) {
    recommendation = 'hire'
    confidence = 85
    reasoning = [
      `Strong technical performance (${Math.round(avgScore)}% overall score)`,
      'No critical issues found',
      `Reasonable AI usage (${Math.round(avgAIUsage)}%)`,
      'Recommended for technical interview'
    ]
  } else if (avgScore >= 60 && criticalFlags <= 1) {
    recommendation = 'maybe'
    confidence = 65
    reasoning = [
      `Moderate technical score (${Math.round(avgScore)}%)`,
      `${redFlagCount} concern(s) require review`,
      'Requires thorough technical assessment',
      'Proceed with detailed interview'
    ]
  } else {
    recommendation = 'no_hire'
    confidence = 80
    reasoning = [
      `Low technical score (${Math.round(avgScore)}%)`,
      `${redFlagCount} red flag(s) detected`,
      criticalFlags > 0 ? `${criticalFlags} critical issue(s)` : 'Multiple concerns',
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
    `🔍 Starting Gemini-powered GitHub analysis for: ${username}`,
    `📊 Profile discovery: ${repositoryCount} public repositories found`,
    `🎯 Repository prioritization: Selected ${Math.min(analysisCount, repositoryCount)} most relevant projects`,
    `🤖 Gemini 2.5 Flash analysis: Deep-diving into code quality and AI usage patterns`,
    `📁 Comprehensive data collection: Repository metadata, commits, and documentation`,
    `🔗 Resume cross-reference: Matching projects against candidate claims`,
    `🏗️ Code quality assessment: Analyzing naming, structure, documentation, and AI usage`,
    `👥 Collaboration analysis: Evaluating group vs individual contributions`,
    `🔴 Risk assessment: Scanning for authenticity concerns and red flags`,
    `📈 Completeness evaluation: Checking demos, documentation, and project polish`,
    `🎯 Technical skill validation: Aligning technologies with job requirements`,
    `⚖️ Hiring decision synthesis: Weighing all factors for recommendation`,
    `${redFlags.length > 0 ? `⚠️ Alert: ${redFlags.length} red flag(s) detected requiring attention` : '✅ Clean profile: No major concerns identified'}`,
    `📋 Resume verification: ${resumeMatches > 0 ? `${resumeMatches} project(s) validated` : 'No matching projects found'}`,
    `🎉 Gemini analysis complete: Comprehensive GitHub evaluation ready for review`
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

    if (!genAI) {
      return res.status(500).json({ 
        error: 'Gemini API not configured',
        details: 'GEMINI_API_KEY environment variable is required',
        apiStatus: 'error'
      })
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

    console.log(`🔍 Starting Gemini-powered GitHub analysis for: ${username}`)

    // Fetch GitHub profile
    const profile = await fetchGitHubProfile(username)
    console.log(`📊 Profile found: ${profile.public_repos} repos, ${profile.followers} followers, member since ${new Date(profile.created_at).getFullYear()}`)
    
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
      .slice(0, 8) // Analyze top 8 repositories for optimal performance
    
    console.log(`🎯 Repository prioritization: Analyzing ${prioritizedRepos.length} high-priority repositories`)
    
    // Detailed repository analysis with Gemini
    const repositoryAnalyses: ProjectAnalysis[] = []
    
    for (let i = 0; i < prioritizedRepos.length; i++) {
      const repo = prioritizedRepos[i]
      console.log(`🤖 Gemini analysis ${i + 1}/${prioritizedRepos.length}: ${repo.name}`)
      
      const repoDetails = await fetchRepositoryDetails(username, repo.name)
      
      if (repoDetails) {
        const analysis = await analyzeProjectWithGemini(repoDetails, resumeText, jobSkills)
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
    const avgGeminiConfidence = repositoryAnalyses.reduce((sum, r) => sum + r.code_quality.gemini_confidence, 0) / repositoryAnalyses.length

    if (avgCodeQuality > 80) positiveIndicators.push(`🏆 Excellent code quality: ${Math.round(avgCodeQuality)}% average`)
    if (resumeMatchedRepos > 0) positiveIndicators.push(`✅ Resume verified: ${resumeMatchedRepos} matching projects`)
    if (projectsWithDemos > repositoryAnalyses.length * 0.5) positiveIndicators.push(`🎯 Demo-oriented: ${projectsWithDemos} projects with live demos`)
    if (profile.followers > 50) positiveIndicators.push(`🌟 Community recognition: ${profile.followers} followers`)
    if (originalProjects > forkedProjects * 2) positiveIndicators.push(`💡 Original work focus: ${originalProjects} original vs ${forkedProjects} forked repos`)
    if (avgGeminiConfidence > 85) positiveIndicators.push(`🤖 High analysis confidence: ${Math.round(avgGeminiConfidence)}% Gemini certainty`)
    
    // Calculate comprehensive metrics
    const technicalScore = Math.min(100, 
      (avgCodeQuality * 0.4) + 
      (resumeMatchedRepos * 15) + 
      (projectsWithDemos * 8) + 
      Math.min(20, profile.followers * 0.2)
    )
    
    const activityScore = Math.min(100, 
      (repositories.length * 1.5) + 
      (profile.followers * 0.3) + 
      (repositoryAnalyses.reduce((sum, r) => sum + r.completeness_score, 0) / repositoryAnalyses.length * 0.4) +
      (activeRepos.length * 2)
    )

    const avgAIUsage = repositoryAnalyses.reduce((sum, r) => sum + r.code_quality.ai_usage_percentage, 0) / repositoryAnalyses.length
    const authenticityScore = Math.max(0, 100 - (globalRedFlags.length * 15) - (avgAIUsage * 0.3))

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
    if (avgAIUsage > 50) {
      recommendations.push(`🤖 AI dependency: ${Math.round(avgAIUsage)}% average AI usage - assess independent coding ability`)
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
      chain_of_thought: chainOfThought,
      gemini_insights: {
        ai_detection_confidence: Math.round(avgGeminiConfidence),
        overall_assessment: avgCodeQuality > 80 ? 'Strong technical candidate' : avgCodeQuality > 60 ? 'Moderate technical skills' : 'Requires assessment',
        hiring_recommendation: technicalScore > 80 ? 'Recommended for hire' : technicalScore > 60 ? 'Consider with caution' : 'High risk candidate'
      }
    }

    // Calculate hiring verdict
    const hiringVerdict = calculateHiringVerdict(analysis)

    const finalAnalysis: GitHubAnalysis = {
      ...analysis,
      hiring_verdict: hiringVerdict
    }

    console.log(`🎉 Gemini analysis completed for ${username}`)
    console.log(`📊 Final scores - Technical: ${finalAnalysis.technical_score}%, Activity: ${finalAnalysis.activity_score}%, Authenticity: ${finalAnalysis.authenticity_score}%`)
    console.log(`🎯 Hiring verdict: ${hiringVerdict.recommendation.toUpperCase()} (${hiringVerdict.confidence}% confidence)`)
    console.log(`🤖 Gemini insights: ${Math.round(avgAIUsage)}% avg AI usage, ${Math.round(avgGeminiConfidence)}% confidence`)

    res.status(200).json({
      success: true,
      analysis: finalAnalysis,
      apiStatus: 'working',
      processingTime: Date.now()
    })

  } catch (error: any) {
    console.error('❌ Gemini GitHub analysis failed for:', req.body?.username, 'Error:', error.message)
    
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

    if (error.message.includes('Gemini API not configured')) {
      return res.status(500).json({
        error: 'Gemini API not configured',
        details: 'GEMINI_API_KEY environment variable is required',
        apiStatus: 'error',
        suggestion: 'Configure Gemini API key in environment variables'
      })
    }
    
    res.status(500).json({
      error: 'Failed to analyze GitHub profile',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Gemini analysis failed',
      apiStatus: 'error',
      username: req.body?.username
    })
  }
} 