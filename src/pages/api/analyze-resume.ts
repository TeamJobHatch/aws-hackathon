import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import multer from 'multer'
import parsePdf from 'pdf-parse'
import mammoth from 'mammoth'
import { ResumeAnalysis } from '@/types'

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
    
    // Extract candidate info
    const candidateInfo = extractCandidateInfo(resumeText)

    // Prepare prompt for AI analysis
    const analysisPrompt = `You are an expert HR professional analyzing a resume against a job description. 

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Description: ${jobDescription.description}
Requirements: ${jobDescription.requirements.join('\n- ')}
Qualifications: ${jobDescription.qualifications.join('\n- ')}

CANDIDATE RESUME:
${resumeText}

Please analyze this resume against the job requirements and provide a detailed assessment in the following JSON format:

{
  "matchPercentage": number (0-100),
  "overallScore": number (0-100),
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
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
  "recommendations": ["recommendation1", "recommendation2", ...],
  "summary": "A concise summary of the candidate's fit for this role"
}

Focus on:
1. Technical skills alignment
2. Experience level and relevance
3. Educational background
4. Soft skills and cultural fit indicators
5. Areas where the candidate excels or needs improvement

Be thorough but concise in your analysis.`

    // Get AI analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR professional and resume analyst. Provide detailed, objective analysis in valid JSON format only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    })

    let analysis: ResumeAnalysis
    try {
      const aiResponse = completion.choices[0]?.message?.content || '{}'
      analysis = JSON.parse(aiResponse)
    } catch (parseError) {
      // Fallback analysis if JSON parsing fails
      analysis = {
        matchPercentage: 50,
        overallScore: 50,
        strengths: ['Resume uploaded successfully'],
        weaknesses: ['Unable to perform detailed analysis'],
        skillsMatch: [],
        experienceMatch: {
          requiredYears: 0,
          candidateYears: 0,
          relevantExperience: [],
          score: 50
        },
        recommendations: ['Manual review recommended'],
        summary: 'AI analysis encountered an error. Please review manually.'
      }
    }

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
      content: resumeText,
      analysis
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Resume analysis error:', error)
    res.status(500).json({ 
      error: 'Failed to analyze resume. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
} 