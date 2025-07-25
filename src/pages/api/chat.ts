import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, uploadedFiles } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Create context from uploaded files
    let context = ''
    if (uploadedFiles && uploadedFiles.length > 0) {
      context = '\n\nContext from uploaded documents:\n'
      uploadedFiles.forEach((file: any) => {
        context += `\n--- ${file.name} ---\n${file.content}\n`
      })
    }

    const systemPrompt = `You are a professional AI job application assistant. Your role is to help users with:
    
    1. Resume optimization and feedback
    2. Cover letter writing and customization
    3. Interview preparation and practice questions
    4. Job application strategy and tips
    5. Career advice and guidance
    6. Analyzing job descriptions and matching skills
    
    Be helpful, professional, and provide actionable advice. If you have access to the user's documents (resume, portfolio, etc.), use that information to give personalized recommendations.
    
    Always be encouraging and supportive while providing honest, constructive feedback.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message + context
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    res.status(200).json({ message: aiResponse })
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ error: 'Failed to process your request. Please try again.' })
  }
} 