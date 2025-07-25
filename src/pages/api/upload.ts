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
    return pdfData.text
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const docData = await mammoth.extractRawText({ buffer })
    return docData.value
  } else if (mimetype === 'text/plain') {
    return buffer.toString('utf-8')
  } else {
    throw new Error('Unsupported file type')
  }
}

async function extractJobDescriptionData(content: string) {
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
${content}

Return only valid JSON, no other text.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured data from job descriptions. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    })

    const response = completion.choices[0]?.message?.content || '{}'
    return JSON.parse(response)
  } catch (error) {
    console.error('Error extracting job description data:', error)
    return {
      title: 'Job Position',
      company: '',
      location: '',
      salary: '',
      requirements: [],
      qualifications: [],
      skills: []
    }
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

    let response: any = {
      id: Date.now().toString(),
      name: file.originalname,
      type: file.mimetype === 'application/pdf' ? 'pdf' : 'docx',
      content,
      uploadedAt: new Date()
    }

    // If it's a job description, extract structured data
    if (fileType === 'job-description') {
      const extractedData = await extractJobDescriptionData(content)
      response.extractedData = extractedData
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: 'Failed to process file. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
} 