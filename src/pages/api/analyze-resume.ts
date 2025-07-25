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

Provide your analysis in this exact JSON format:
{
  "overallScore": 85,
  "matchPercentage": 80,
  "summary": "Brief 2-3 sentence summary of the candidate's fit for this role",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "skillsMatch": [
    {"skill": "JavaScript", "hasSkill": true, "level": "Advanced"},
    {"skill": "React", "hasSkill": true, "level": "Intermediate"}
  ],
  "experienceMatch": {
    "score": 75,
    "requiredYears": 3,
    "candidateYears": 5,
    "relevantExperience": ["Experience detail 1", "Experience detail 2"]
  }
}

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

    // Extract candidate info
    const candidateInfo = extractCandidateInfo(resumeText)

    // Use the enhanced AI analysis function
    const analysis = await generateEnhancedAnalysis(resumeText, jobDescription)

    // Check for GitHub profile in resume
    const githubMatch = resumeText.match(/github\.com\/([a-zA-Z0-9-_]+)/i)
    if (githubMatch) {
      // TODO: Implement GitHub profile analysis
      // This would fetch the user's GitHub profile and analyze repositories
    }

    const response = {
      id: Date.now().toString(),
      candidateName: candidateInfo.name,
      email: candidateInfo.email,
      phone: candidateInfo.phone,
      filename: file.originalname,
      content: resumeText.substring(0, 1000) + (resumeText.length > 1000 ? '...' : ''),
      analysis,
      apiStatus: 'working'
    }

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