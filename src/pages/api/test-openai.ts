import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        apiStatus: 'error',
        details: 'Environment variable OPENAI_API_KEY is missing'
      })
    }

    // Test with a simple API call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: 'Respond with just "API_TEST_SUCCESS" and nothing else.'
        }
      ],
      max_tokens: 10,
      temperature: 0,
    })

    const response = completion.choices[0]?.message?.content?.trim() || ''
    
    if (response.includes('API_TEST_SUCCESS')) {
      return res.status(200).json({
        success: true,
        apiStatus: 'working',
        message: 'OpenAI API is working correctly',
        model: 'gpt-4o',
        response: response
      })
    } else {
      return res.status(200).json({
        success: false,
        apiStatus: 'limited',
        message: 'OpenAI API responded but with unexpected content',
        response: response
      })
    }

  } catch (error: any) {
    console.error('OpenAI API test error:', error)
    
    let errorStatus = 'error'
    let errorMessage = 'OpenAI API test failed'
    
    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      errorStatus = 'limited'
      errorMessage = 'OpenAI API rate limit exceeded'
    } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      errorMessage = 'OpenAI API authentication failed'
    } else if (error.message?.includes('model')) {
      errorMessage = 'OpenAI model not available'
    }

    return res.status(500).json({
      success: false,
      apiStatus: errorStatus,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      keyExists: !!process.env.OPENAI_API_KEY,
      keyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'missing'
    })
  }
} 