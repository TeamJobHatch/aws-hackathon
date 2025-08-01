import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import multer from 'multer'
import parsePdf from 'pdf-parse'
import mammoth from 'mammoth'
import { ResumeAnalysis, JobDescription } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const { buffer, mimetype } = file

  if (mimetype === 'application/pdf') {
    const pdfData = await parsePdf(buffer)
    return pdfData.text
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const docData = await mammoth.extractRawText({ buffer })
    return docData.value
  } else {
    throw new Error('Unsupported file type')
  }
}

function extractCandidateInfo(resumeText: string): { name: string; email?: string; phone?: string } {
  // Simple regex patterns to extract basic info
  const nameMatch = resumeText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m)
  const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
  const phoneMatch = resumeText.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i)

  return {
    name: nameMatch ? nameMatch[1] : 'Unknown Candidate',
    email: emailMatch ? emailMatch[1] : undefined,
    phone: phoneMatch ? phoneMatch[1] : undefined,
  }
}

function createFallbackLinkedInAnalysis(linkedinUrl: string, resumeText: string) {
  console.log('Creating fallback LinkedIn analysis...')
  
  return {
    profile_url: linkedinUrl,
    honesty_score: 75, // Neutral score when analysis fails
    profile_data: {
      name: 'Profile analysis unavailable',
      title: 'Unable to fetch profile data',
      company: 'N/A',
      location: 'N/A',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      languages: [],
      connections: 0,
      profilePicture: false,
      headline: '',
      summary: ''
    },
    inconsistencies: [],
    verified_info: [
      `Profile URL: ${linkedinUrl}`,
      'Note: Full analysis unavailable in this environment'
    ],
    red_flags: ['LinkedIn analysis service temporarily unavailable'],
    positive_indicators: ['LinkedIn profile URL provided'],
    recommendations: [
      'Manual verification of LinkedIn profile recommended',
      'Check profile authenticity during interview process'
    ],
    profile_completeness: 50,
    professional_score: 50,
    chain_of_thought: [
      'LinkedIn analysis service encountered an error',
      'Falling back to basic profile acknowledgment',
      'Manual review recommended for this candidate'
    ]
  }
}

function createFallbackGitHubAnalysis(githubUrl: string, username: string, resumeText: string) {
  console.log('Creating fallback GitHub analysis...')
  
  return {
    username: username,
    profile: {
      login: username,
      name: 'Profile analysis unavailable',
      bio: undefined,
      avatar_url: '',
      html_url: githubUrl,
      public_repos: 0,
      followers: 0,
      following: 0,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      company: undefined,
      location: undefined
    },
    repository_analysis: [],
    overall_metrics: {
      total_repos: 0,
      active_repos: 0,
      resume_matched_repos: 0,
      average_code_quality: 50,
      commit_consistency: 50,
      collaboration_score: 50,
      original_projects: 0,
      forked_projects: 0,
      project_diversity_score: 50
    },
    red_flags: ['GitHub analysis service temporarily unavailable'],
    positive_indicators: ['GitHub profile URL provided'],
    technical_score: 50,
    activity_score: 50,
    authenticity_score: 50,
    recommendations: [
      'Manual review of GitHub profile recommended',
      'Verify repositories and code quality during technical interview'
    ],
    chain_of_thought: [
      'GitHub analysis service encountered an error',
      'Falling back to basic profile acknowledgment',
      'Technical assessment recommended during interview process'
    ],
    hiring_verdict: {
      recommendation: 'maybe' as const,
      confidence: 50,
      reasoning: ['Analysis service unavailable', 'Manual verification needed']
    },
    gemini_insights: {
      ai_detection_confidence: 50,
      overall_assessment: 'Analysis unavailable - manual review required',
      hiring_recommendation: 'Conduct technical interview to assess capabilities'
    }
  }
}

async function fallbackLinkExtraction(resumeText: string): Promise<{ github?: string; linkedin?: string; portfolio?: string; website?: string; other: { url: string; type: string }[] }> {
  console.log('=== FALLBACK LINK EXTRACTION ===')
  console.log('Searching resume text for any URLs...')
  
  // Enhanced regex patterns to catch more URL variations
  const urlRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi
  const githubPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-_]+)/gi
  const linkedinPattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/gi
  
  // Additional patterns for partial URLs
  const githubUserPattern = /github:?\s*([a-zA-Z0-9-_]+)/gi
  const linkedinUserPattern = /linkedin:?\s*([a-zA-Z0-9-_]+)/gi
  
  const urls = resumeText.match(urlRegex) || []
  const githubMatches = resumeText.match(githubPattern) || []
  const linkedinMatches = resumeText.match(linkedinPattern) || []
  
  console.log('Found URLs:', urls)
  console.log('Found GitHub patterns:', githubMatches)
  console.log('Found LinkedIn patterns:', linkedinMatches)
  
  const links = {
    github: undefined as string | undefined,
    linkedin: undefined as string | undefined,
    portfolio: undefined as string | undefined,
    website: undefined as string | undefined,
    other: [] as { url: string; type: string }[]
  }

  // Process GitHub matches first
  if (githubMatches.length > 0 && !links.github) {
    for (const match of githubMatches) {
      const usernameMatch = match.match(/github\.com\/([a-zA-Z0-9-_]+)/i)
      if (usernameMatch && usernameMatch[1]) {
        const username = usernameMatch[1]
        if (username !== 'github' && !username.includes('.') && username.length > 1) {
          links.github = `https://github.com/${username}`
          console.log('Fallback extracted GitHub:', links.github)
          break
        }
      }
    }
  }

  // Process LinkedIn matches
  if (linkedinMatches.length > 0 && !links.linkedin) {
    for (const match of linkedinMatches) {
      if (match.includes('linkedin.com/in/')) {
        let url = match.startsWith('http') ? match : `https://${match}`
        // Clean up the URL
        url = url.replace(/[).,;]$/, '') // Remove trailing punctuation
        links.linkedin = url
        console.log('Fallback extracted LinkedIn:', links.linkedin)
        break
      }
    }
  }

  // Process other URLs
  for (const url of urls) {
    const lowerUrl = url.toLowerCase()
    if ((lowerUrl.includes('portfolio') || lowerUrl.includes('.dev') || lowerUrl.includes('.me')) && !links.portfolio) {
      links.portfolio = url
      console.log('Fallback extracted Portfolio:', links.portfolio)
    } else if (!links.website && !lowerUrl.includes('github.com') && !lowerUrl.includes('linkedin.com')) {
      links.website = url
      console.log('Fallback extracted Website:', links.website)
    }
  }

  console.log('Fallback extraction completed:', links)
  return links
}

async function extractCandidateLinksWithAI(resumeText: string): Promise<{ github?: string; linkedin?: string; portfolio?: string; website?: string; other: { url: string; type: string }[] }> {
  console.log('=== STARTING ROBUST LINK EXTRACTION ===')
  console.log('Resume text length:', resumeText.length)
  console.log('Resume text sample:', resumeText.substring(0, 500))
  console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY)
  console.log('Environment:', process.env.NODE_ENV)

  // Always try fallback first for Vercel reliability
  console.log('Getting fallback extraction first for reliability...')
  const fallbackResult = await fallbackLinkExtraction(resumeText)
  console.log('Fallback extraction result:', fallbackResult)

  // Skip AI if no API key (prevents Vercel errors)
  if (!process.env.OPENAI_API_KEY) {
    console.log('No OpenAI API key - using fallback only')
    return fallbackResult
  }

  console.log('Attempting AI-powered extraction with timeout...')

  const prompt = `
EXTRACT PROFESSIONAL LINKS FROM THIS RESUME:

${resumeText.substring(0, 3000)}

Find and return these professional links in exact JSON format:

{
  "github": "https://github.com/username",
  "linkedin": "https://linkedin.com/in/profile", 
  "portfolio": "https://portfolio-site.com",
  "website": "https://website.com",
  "other": []
}

INSTRUCTIONS:
1. Look for GitHub usernames or URLs (NOT email domains like @cornell.edu)
2. Look for LinkedIn profile URLs  
3. Look for portfolio/personal websites
4. If you find partial info, construct complete URLs
5. Return ONLY the JSON object, no other text
6. If no links found, use null for missing fields

FOCUS ON: github.com links, linkedin.com/in links, portfolio sites, personal websites`

  try {
    // Create timeout promise for Vercel compatibility
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI extraction timeout after 15 seconds')), 15000)
    })

    const aiPromise = openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured contact information from resumes. Extract only professional links and profiles, being very careful to distinguish between actual usernames and email domains.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    })

    const completion = await Promise.race([aiPromise, timeoutPromise])

    const response = completion.choices[0]?.message?.content || '{}'
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    
    console.log('AI response for link extraction:', cleanedResponse)
    
    const parsed = JSON.parse(cleanedResponse)
    
    // Start with fallback results, then enhance with AI results
    const links = {
      github: fallbackResult.github,
      linkedin: fallbackResult.linkedin,
      portfolio: fallbackResult.portfolio,
      website: fallbackResult.website,
      other: [...fallbackResult.other]
    }

    // Override with AI results if they are better/valid
    if (parsed.github && typeof parsed.github === 'string') {
      const githubUrl = parsed.github.trim()
      if (githubUrl.includes('github.com/') && !githubUrl.includes('@') && !githubUrl.includes('.edu')) {
        links.github = githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`
        console.log('AI enhanced GitHub:', links.github)
      }
    }

    // Validate LinkedIn URL
    if (parsed.linkedin && typeof parsed.linkedin === 'string') {
      const linkedinUrl = parsed.linkedin.trim()
      if (linkedinUrl.includes('linkedin.com/in/')) {
        links.linkedin = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`
        console.log('AI enhanced LinkedIn:', links.linkedin)
      }
    }

    // Validate Portfolio URL
    if (parsed.portfolio && typeof parsed.portfolio === 'string') {
      const portfolioUrl = parsed.portfolio.trim()
      if (portfolioUrl.includes('.') && !portfolioUrl.includes('@')) {
        links.portfolio = portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`
        console.log('AI enhanced Portfolio:', links.portfolio)
      }
    }

    // Validate Website URL
    if (parsed.website && typeof parsed.website === 'string') {
      const websiteUrl = parsed.website.trim()
      if (websiteUrl.includes('.') && !websiteUrl.includes('@')) {
        links.website = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
        console.log('AI enhanced Website:', links.website)
      }
    }

    // Validate other links
    if (Array.isArray(parsed.other)) {
      for (const item of parsed.other) {
        if (item.url && typeof item.url === 'string' && item.url.includes('.') && !item.url.includes('@')) {
          const url = item.url.startsWith('http') ? item.url : `https://${item.url}`
          links.other.push({
            url,
            type: item.type || 'website'
          })
        }
      }
    }

    console.log('Final enhanced links (fallback + AI):', links)
    return links

  } catch (error) {
    console.error('AI enhancement failed (using fallback):', error)
    console.log('Returning fallback extraction result')
    
    // Return the fallback result we already have
    return fallbackResult
  }
}

async function generateEnhancedAnalysis(resumeText: string, jobDescription: JobDescription): Promise<ResumeAnalysis> {
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not configured')
    throw new Error('AI analysis service not configured')
  }

  const prompt = `
You are an expert HR analyst. Analyze this resume against the job description and provide a detailed assessment.

Job Title: ${jobDescription.title}
Company: ${jobDescription.company}
Job Requirements: ${jobDescription.requirements.join(', ')}
Job Skills: ${jobDescription.skills.join(', ')}

Resume Content:
${resumeText.substring(0, 4000)}

Provide a comprehensive analysis in this exact JSON format:
{
  "overallScore": 85,
  "matchPercentage": 80,
  "summary": "Brief 2-3 sentence summary of the candidate's fit for this role",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "detailedInsights": [
    "Specific insight about technical abilities",
    "Leadership and collaboration analysis", 
    "Career progression assessment",
    "Project impact evaluation"
  ],
  "technicalSkills": ["JavaScript", "React", "Node.js", "Python", "AWS"],
  "softSkills": ["Leadership", "Communication", "Problem-solving", "Teamwork"],
  "skillsMatch": [
    {"skill": "JavaScript", "found": true, "confidence": 90, "evidence": ["Used in multiple projects", "5+ years experience"]},
    {"skill": "React", "found": true, "confidence": 85, "evidence": ["Frontend development role", "Component architecture"]}
  ],
  "experienceMatch": {
    "score": 75,
    "requiredYears": 3,
    "candidateYears": 5,
    "relevantExperience": ["5 years in software development", "Led cross-functional teams", "Built scalable applications"]
  }
}

Instructions:
- Be thorough in identifying technical skills from the resume content
- Include both hard and soft skills demonstrated through experience
- Provide specific evidence for skill matches when possible
- Give detailed insights about the candidate's career progression, project impact, and professional growth
- Consider leadership experience, collaboration, and problem-solving abilities
- Assess cultural fit and potential for the specific role and company

Return only the JSON object, no other text.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR analyst specializing in resume evaluation. Provide thorough, objective analysis with specific scores and detailed feedback. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.2,
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    // Clean markdown formatting if present
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
    
    const analysis = JSON.parse(cleanedResponse)

    // Validate and ensure required fields with proper types
    const validatedAnalysis: ResumeAnalysis = {
      overallScore: Math.min(100, Math.max(0, Number(analysis.overallScore) || 0)),
      matchPercentage: Math.min(100, Math.max(0, Number(analysis.matchPercentage) || 0)),
      summary: analysis.summary || 'Analysis completed using AI assessment.',
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : ['Professional background identified'],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : ['Areas for improvement noted'],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : ['Consider for interview'],
      detailedInsights: Array.isArray(analysis.detailedInsights) ? analysis.detailedInsights : ['Comprehensive analysis completed'],
      technicalSkills: Array.isArray(analysis.technicalSkills) ? analysis.technicalSkills : [],
      softSkills: Array.isArray(analysis.softSkills) ? analysis.softSkills : [],
      skillsMatch: Array.isArray(analysis.skillsMatch) ? analysis.skillsMatch : [],
      experienceMatch: analysis.experienceMatch && typeof analysis.experienceMatch === 'object' ? {
        score: Math.min(100, Math.max(0, Number(analysis.experienceMatch.score) || 0)),
        requiredYears: Number(analysis.experienceMatch.requiredYears) || 0,
        candidateYears: Number(analysis.experienceMatch.candidateYears) || 0,
        relevantExperience: Array.isArray(analysis.experienceMatch.relevantExperience) ? 
          analysis.experienceMatch.relevantExperience : ['Experience assessed']
      } : {
        score: 50,
        requiredYears: 0,
        candidateYears: 0,
        relevantExperience: ['Experience assessment completed']
      }
    }

    console.log(`AI Analysis completed with ${validatedAnalysis.overallScore}% overall score`)
    return validatedAnalysis

  } catch (error: any) {
    console.error('OpenAI API error:', error)
    throw new Error(`AI analysis failed: ${error.message}`)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('file'))

    const file = (req as any).file
    const jobDescriptionStr = (req as any).body.jobDescription

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    if (!jobDescriptionStr) {
      return res.status(400).json({ error: 'Job description is required' })
    }

    const jobDescription = JSON.parse(jobDescriptionStr)

    // Extract text from uploaded resume
    const resumeText = await extractTextFromFile(file)
    
    // Check if text extraction was successful
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ 
        error: 'Unable to extract sufficient text from resume. Please check the file format.',
        apiStatus: 'error'
      })
    }

    // Extract candidate info and links
    const candidateInfo = extractCandidateInfo(resumeText)
    console.log('Resume text length:', resumeText.length)
    console.log('Resume text preview:', resumeText.substring(0, 500))
    
    const candidateLinks = await extractCandidateLinksWithAI(resumeText)
    console.log('Extracted candidate links:', JSON.stringify(candidateLinks, null, 2))

    // Use the enhanced AI analysis function
    let analysis = await generateEnhancedAnalysis(resumeText, jobDescription)

    // Analyze GitHub profile if found
    if (candidateLinks.github) {
      try {
        const githubUsername = candidateLinks.github.split('/').pop()
                  console.log('Extracted GitHub username from URL:', githubUsername, 'from URL:', candidateLinks.github)
          
          // Validate GitHub username
          if (githubUsername && 
              githubUsername.length > 0 && 
              githubUsername.length < 40 && 
              !/\.(edu|com|org|net|gov)$/.test(githubUsername) &&
              !githubUsername.includes('@') &&
              !githubUsername.includes('.') &&
              /^[a-zA-Z0-9-_]+$/.test(githubUsername)) {
            
            console.log('💻 Starting deep GitHub analysis for:', githubUsername)
            
            // Construct the correct URL for both Vercel and local development
            const baseUrl = process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}` 
              : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            
            console.log('Using base URL for GitHub analysis:', baseUrl)
            
            const githubResponse = await fetch(`${baseUrl}/api/github-analyzer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: githubUsername,
                jobSkills: jobDescription.skills,
                resumeText: resumeText
              }),
              // Add timeout for Vercel
              signal: AbortSignal.timeout(25000)
            })

                      if (githubResponse.ok) {
              const githubData = await githubResponse.json()
              if (githubData.success && githubData.analysis) {
                analysis.githubAnalysis = githubData.analysis
                console.log('✅ GitHub deep analysis completed for:', githubUsername)
                console.log('📊 GitHub metrics:', {
                  technical: githubData.analysis.technical_score,
                  activity: githubData.analysis.activity_score,
                  projects: githubData.analysis.repository_analysis?.length || 0,
                  resumeMatches: githubData.analysis.overall_metrics?.resume_matched_repos || 0,
                  redFlags: githubData.analysis.red_flags?.length || 0
                })
              } else {
                console.log('❌ GitHub analysis response invalid:', githubData)
                
                // Add fallback GitHub analysis
                analysis.githubAnalysis = createFallbackGitHubAnalysis(candidateLinks.github, githubUsername, resumeText)
              }
            } else {
              console.log('❌ GitHub analysis failed with status:', githubResponse.status)
              const errorText = await githubResponse.text()
              console.log('GitHub error response:', errorText)
              
              // Add fallback GitHub analysis
              analysis.githubAnalysis = createFallbackGitHubAnalysis(candidateLinks.github, githubUsername, resumeText)
            }
        } else {
          console.log('Invalid GitHub username detected, skipping analysis:', githubUsername)
        }
      } catch (error) {
        console.log('GitHub analysis failed:', error)
        
        // Add fallback GitHub analysis
        const githubUsername = candidateLinks.github.split('/').pop()
        if (githubUsername) {
          analysis.githubAnalysis = createFallbackGitHubAnalysis(candidateLinks.github, githubUsername, resumeText)
        }
      }
    } else {
      console.log('No GitHub URL found in candidate links')
    }

    // Analyze LinkedIn profile if found with chain of thought
    if (candidateLinks.linkedin) {
      try {
        console.log('🔍 Starting LinkedIn profile analysis:', candidateLinks.linkedin)
        
        // Construct the correct URL for both Vercel and local development
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        
        console.log('Using base URL for LinkedIn analysis:', baseUrl)
        
        const linkedinResponse = await fetch(`${baseUrl}/api/linkedin-analyzer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            linkedInUrl: candidateLinks.linkedin,
            resumeText: resumeText
          }),
          // Add timeout for Vercel
          signal: AbortSignal.timeout(25000)
        })

        if (linkedinResponse.ok) {
          const linkedinData = await linkedinResponse.json()
          analysis.linkedinAnalysis = linkedinData.analysis
          console.log('✅ LinkedIn analysis completed successfully')
          console.log('📊 LinkedIn scores:', {
            honesty: linkedinData.analysis.honesty_score,
            completeness: linkedinData.analysis.profile_completeness,
            professional: linkedinData.analysis.professional_score
          })
          console.log('⚠️ Inconsistencies found:', linkedinData.analysis.inconsistencies.length)
        } else {
          console.log('❌ LinkedIn analysis failed with status:', linkedinResponse.status)
          const errorText = await linkedinResponse.text()
          console.log('LinkedIn error response:', errorText)
          
          // Add fallback LinkedIn analysis
          analysis.linkedinAnalysis = createFallbackLinkedInAnalysis(candidateLinks.linkedin, resumeText)
        }
      } catch (error) {
        console.log('❌ LinkedIn analysis failed with error:', error)
        
        // Add fallback LinkedIn analysis
        analysis.linkedinAnalysis = createFallbackLinkedInAnalysis(candidateLinks.linkedin, resumeText)
      }
    } else {
      console.log('ℹ️ No LinkedIn URL found for profile analysis')
    }

    const response = {
      id: Date.now().toString(),
      candidateName: candidateInfo.name,
      email: candidateInfo.email,
      phone: candidateInfo.phone,
      filename: file.originalname,
      content: resumeText.substring(0, 1000) + (resumeText.length > 1000 ? '...' : ''),
      analysis,
      links: candidateLinks,
      apiStatus: 'working'
    }

    console.log('Final response being sent:', JSON.stringify({
      ...response,
      content: response.content.substring(0, 200) + '...'
    }, null, 2))

    console.log(`Analysis completed for ${candidateInfo.name}: ${analysis.overallScore}% score`)
    res.status(200).json(response)
  } catch (error) {
    console.error('Resume analysis error:', error)
    
    // Provide specific error messages and API status
    let errorMessage = 'Failed to analyze resume. Please try again.'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'
    let apiStatus = 'error'
    let apiMessage = ''
    
    if (errorDetails.includes('OpenAI') || errorDetails.includes('rate limit') || errorDetails.includes('quota')) {
      errorMessage = 'AI analysis service temporarily unavailable. Basic analysis provided.'
      apiStatus = 'limited'
      apiMessage = 'AI quota exceeded'
    } else if (errorDetails.includes('extract')) {
      errorMessage = 'Unable to read the uploaded file. Please check the file format.'
    } else if (errorDetails.includes('API key')) {
      errorMessage = 'Service configuration error. Please contact support.'
      apiMessage = 'API key not configured'
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      apiStatus,
      apiMessage
    })
  }
}

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
} 