import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import multer from 'multer'
import parsePdf from 'pdf-parse'
import mammoth from 'mammoth'
import { EnhancedResumeAnalysis, JobDescription, AIModelConfig } from '@/types'

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

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
  // Enhanced regex patterns for better extraction
  const nameMatch = resumeText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m) || 
                   resumeText.match(/Name:\s*([A-Z][a-z]+ [A-Z][a-z]+)/i)
  const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
  const phoneMatch = resumeText.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i)

  return {
    name: nameMatch?.[1] || 'Unknown Candidate',
    email: emailMatch?.[1],
    phone: phoneMatch?.[1]
  }
}

async function analyzeWithOpenAI(resumeText: string, jobDescription: JobDescription): Promise<EnhancedResumeAnalysis> {
  const startTime = Date.now()
  
  const prompt = `You are an expert HR analyst. Analyze this resume against the job description and provide a comprehensive evaluation.

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Requirements: ${jobDescription.requirements.join(', ')}
Skills: ${jobDescription.skills.join(', ')}
Experience: ${jobDescription.experience}

RESUME:
${resumeText}

Provide analysis in this exact JSON format:
{
  "matchPercentage": number (0-100),
  "overallScore": number (0-100),
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "skillsMatch": [
    {
      "skill": "skill name",
      "found": boolean,
      "confidence": number (0-100),
      "evidence": ["evidence1", "evidence2"]
    }
  ],
  "experienceMatch": {
    "requiredYears": number,
    "candidateYears": number,
    "relevantExperience": ["experience1", "experience2"],
    "score": number (0-100)
  },
  "recommendations": ["recommendation1", "recommendation2"],
  "summary": "detailed summary of the candidate",
  "detailedInsights": ["insight1", "insight2", "insight3"],
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 2000,
  })

  const processingTime = Date.now() - startTime
  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    const analysis = JSON.parse(content)
    return {
      ...analysis,
      aiModel: 'openai' as const,
      modelVersion: 'gpt-4o',
      processingTime,
      confidence: Math.min(95, analysis.matchPercentage + 5) // OpenAI tends to be more confident
    }
  } catch (error) {
    throw new Error('Failed to parse OpenAI response as JSON')
  }
}

async function analyzeWithGemini(resumeText: string, jobDescription: JobDescription): Promise<EnhancedResumeAnalysis> {
  if (!genAI) {
    throw new Error('Gemini API not configured')
  }

  const startTime = Date.now()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are an expert HR analyst. Analyze this resume against the job description and provide a comprehensive evaluation.

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Requirements: ${jobDescription.requirements.join(', ')}
Skills: ${jobDescription.skills.join(', ')}
Experience: ${jobDescription.experience}

RESUME:
${resumeText}

Provide analysis in this exact JSON format:
{
  "matchPercentage": number (0-100),
  "overallScore": number (0-100),
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "skillsMatch": [
    {
      "skill": "skill name",
      "found": boolean,
      "confidence": number (0-100),
      "evidence": ["evidence1", "evidence2"]
    }
  ],
  "experienceMatch": {
    "requiredYears": number,
    "candidateYears": number,
    "relevantExperience": ["experience1", "experience2"],
    "score": number (0-100)
  },
  "recommendations": ["recommendation1", "recommendation2"],
  "summary": "detailed summary of the candidate",
  "detailedInsights": ["insight1", "insight2", "insight3"],
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"]
}`

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }]
  })

  const processingTime = Date.now() - startTime
  const content = result.response.text()

  if (!content) {
    throw new Error('No response from Gemini')
  }

  try {
    // Clean the response to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response')
    }

    const analysis = JSON.parse(jsonMatch[0])
    return {
      ...analysis,
      aiModel: 'gemini' as const,
      modelVersion: 'gemini-1.5-flash',
      processingTime,
      confidence: Math.min(90, analysis.matchPercentage) // Gemini tends to be slightly less confident
    }
  } catch (error) {
    throw new Error('Failed to parse Gemini response as JSON')
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Handle file upload
    await runMiddleware(req, res, upload.array('resumes', 10))

    const { jobDescription: jobDescriptionJson, selectedModel = 'openai' } = req.body
    const files = (req as any).files as Express.Multer.File[]

    if (!jobDescriptionJson) {
      return res.status(400).json({ error: 'Job description is required' })
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one resume file is required' })
    }

    // Validate selected model
    if (!['openai', 'gemini'].includes(selectedModel)) {
      return res.status(400).json({ error: 'Invalid AI model selected' })
    }

    const jobDescription: JobDescription = JSON.parse(jobDescriptionJson)
    const results: any[] = []

    // Process each resume
    for (const file of files) {
      try {
        const resumeText = await extractTextFromFile(file)
        const candidateInfo = extractCandidateInfo(resumeText)

        let analysis: EnhancedResumeAnalysis

        // Use selected AI model
        if (selectedModel === 'gemini') {
          analysis = await analyzeWithGemini(resumeText, jobDescription)
        } else {
          analysis = await analyzeWithOpenAI(resumeText, jobDescription)
        }

        results.push({
          id: `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          candidateName: candidateInfo.name,
          email: candidateInfo.email,
          phone: candidateInfo.phone,
          filename: file.originalname,
          content: resumeText,
          uploadedAt: new Date(),
          analysis,
        })

      } catch (error) {
        console.error(`Error processing resume ${file.originalname}:`, error)
        results.push({
          id: `resume_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          candidateName: `Error processing ${file.originalname}`,
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Unknown error',
          uploadedAt: new Date(),
        })
      }
    }

    // Sort by match percentage (highest first)
    const successfulResults = results.filter(r => !r.error)
    const errorResults = results.filter(r => r.error)

    successfulResults.sort((a, b) => {
      const aScore = a.analysis?.matchPercentage || 0
      const bScore = b.analysis?.matchPercentage || 0
      return bScore - aScore
    })

    return res.status(200).json({
      success: true,
      model: selectedModel,
      total: results.length,
      successful: successfulResults.length,
      errors: errorResults.length,
      resumes: [...successfulResults, ...errorResults],
      summary: {
        averageMatch: successfulResults.length > 0 
          ? Math.round(successfulResults.reduce((sum, r) => sum + (r.analysis?.matchPercentage || 0), 0) / successfulResults.length)
          : 0,
        topCandidate: successfulResults[0]?.candidateName || 'None',
        processingTime: successfulResults.reduce((sum, r) => sum + (r.analysis?.processingTime || 0), 0)
      }
    })

  } catch (error) {
    console.error('Resume analysis error:', error)
    return res.status(500).json({
      error: 'Failed to analyze resumes',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 