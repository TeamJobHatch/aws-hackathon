import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import multer from 'multer'
import parsePdf from 'pdf-parse'
import mammoth from 'mammoth'

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
    return pdfData.text || ''
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const docData = await mammoth.extractRawText({ buffer })
    return docData.value || ''
  } else if (mimetype === 'text/plain') {
    return buffer.toString('utf-8')
  } else {
    throw new Error('Unsupported file type')
  }
}

async function extractJobDescriptionData(content: string) {
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    throw { type: 'auth_error', message: 'OpenAI API key not configured.' }
  }

  const prompt = `Extract structured information from this job description. Return a JSON object with the following fields:

{
  "title": "job title",
  "company": "company name",
  "location": "location",
  "salary": "salary range if mentioned",
  "requirements": ["requirement1", "requirement2", ...],
  "qualifications": ["qualification1", "qualification2", ...],
  "skills": ["skill1", "skill2", ...]
}

Job Description:
${content.substring(0, 3000)}

Return only valid JSON, no other text.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured data from job descriptions. Return only valid JSON with proper arrays for requirements, qualifications, and skills.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.1,
    })

    const response = completion.choices[0]?.message?.content || '{}'
    
    // Clean any markdown formatting
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    
    const parsed = JSON.parse(cleanedResponse)
    
    // Validate and ensure arrays
    const validatedData = {
      title: parsed.title || 'Job Position',
      company: parsed.company || 'Company',
      location: parsed.location || '',
      salary: parsed.salary || '',
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : 
                   parsed.requirements ? [parsed.requirements] : ['Professional experience required'],
      qualifications: Array.isArray(parsed.qualifications) ? parsed.qualifications : 
                     parsed.qualifications ? [parsed.qualifications] : ['Relevant education or experience'],
      skills: Array.isArray(parsed.skills) ? parsed.skills : 
             parsed.skills ? [parsed.skills] : ['Technical skills'],
    }
    
    return validatedData
  } catch (error: any) {
    console.error('Error extracting job description data:', error)
    
    // For JSON parsing errors, try to extract data manually
    if (error.message?.includes('JSON')) {
      console.log('JSON parsing failed, attempting manual extraction')
      return createFallbackJobData(content)
    }
    
    // For API errors, rethrow to be handled by caller
    throw error
  }
}

function createFallbackJobData(content: string) {
  // Extract basic information using simple text analysis
  const lines = content.split('\n').filter(line => line.trim().length > 0)
  
  // Try to extract title from first few lines
  let title = 'Job Position'
  for (const line of lines.slice(0, 3)) {
    if (line.length < 100 && (
      line.toLowerCase().includes('developer') ||
      line.toLowerCase().includes('engineer') ||
      line.toLowerCase().includes('manager') ||
      line.toLowerCase().includes('analyst') ||
      line.toLowerCase().includes('designer')
    )) {
      title = line.trim()
      break
    }
  }

  // Extract basic requirements and skills
  const requirements = []
  const skills = []
  const commonSkills = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'git']
  
  for (const skill of commonSkills) {
    if (content.toLowerCase().includes(skill)) {
      skills.push(skill.charAt(0).toUpperCase() + skill.slice(1))
    }
  }

  // Look for experience requirements
  const experienceMatch = content.match(/(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i)
  if (experienceMatch) {
    requirements.push(`${experienceMatch[1]}+ years of experience`)
  }

  return {
    title,
    company: 'Company',
    location: '',
    salary: '',
    requirements: requirements.length > 0 ? requirements : ['Professional experience required'],
    qualifications: ['Relevant education or experience'],
    skills: skills.length > 0 ? skills : ['Technical skills']
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
    const fileType = (req as any).body.type || 'document'

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Extract text from the file
    const content = await extractTextFromFile(file)

    if (!content || content.trim().length < 20) {
      return res.status(400).json({ 
        error: 'Unable to extract sufficient text from file. Please check the file format.' 
      })
    }

    let response: any = {
      id: Date.now().toString(),
      name: file.originalname,
      type: file.mimetype === 'application/pdf' ? 'pdf' : 'docx',
      content,
      uploadedAt: new Date(),
      apiStatus: 'working'
    }

    // If it's a job description, extract structured data
    if (fileType === 'job-description') {
      try {
        const extractedData = await extractJobDescriptionData(content)
        response.extractedData = extractedData
        response.apiStatus = 'working'
      } catch (error: any) {
        console.log('AI extraction failed, using fallback:', error.message)
        
        // Use fallback data and indicate API status
        const fallbackData = createFallbackJobData(content)
        response.extractedData = fallbackData
        
        if (error.type === 'rate_limit') {
          response.apiStatus = 'limited'
          response.apiMessage = 'AI quota exceeded - using basic analysis'
        } else {
          response.apiStatus = 'error'
          response.apiMessage = 'AI temporarily unavailable - using basic analysis'
        }
      }
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: 'Failed to process file. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiStatus: 'error'
    })
  }
}

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
} 