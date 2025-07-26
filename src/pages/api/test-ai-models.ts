import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

interface ModelTestResult {
  model: string
  success: boolean
  apiStatus: 'working' | 'limited' | 'error'
  message: string
  response?: string
  details?: string
  keyExists: boolean
  keyPrefix?: string
}

async function testOpenAI(): Promise<ModelTestResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        model: 'OpenAI GPT-4o',
        success: false,
        apiStatus: 'error',
        message: 'OpenAI API key not configured',
        details: 'Environment variable OPENAI_API_KEY is missing',
        keyExists: false
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: 'Respond with just "OPENAI_TEST_SUCCESS" and nothing else.'
        }
      ],
      max_tokens: 10,
      temperature: 0,
    })

    const response = completion.choices[0]?.message?.content?.trim() || ''
    
    if (response.includes('OPENAI_TEST_SUCCESS')) {
      return {
        model: 'OpenAI GPT-4o',
        success: true,
        apiStatus: 'working',
        message: 'OpenAI API is working correctly',
        response: response,
        keyExists: true,
        keyPrefix: process.env.OPENAI_API_KEY.substring(0, 10) + '...'
      }
    } else {
      return {
        model: 'OpenAI GPT-4o',
        success: false,
        apiStatus: 'limited',
        message: 'OpenAI API responded but with unexpected content',
        response: response,
        keyExists: true,
        keyPrefix: process.env.OPENAI_API_KEY.substring(0, 10) + '...'
      }
    }

  } catch (error: any) {
    console.error('OpenAI API test error:', error)
    
    let errorStatus: 'working' | 'limited' | 'error' = 'error'
    let errorMessage = 'OpenAI API test failed'
    
    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      errorStatus = 'limited'
      errorMessage = 'OpenAI API rate limit exceeded'
    } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      errorMessage = 'OpenAI API authentication failed'
    } else if (error.message?.includes('model')) {
      errorMessage = 'OpenAI model not available'
    }

    return {
      model: 'OpenAI GPT-4o',
      success: false,
      apiStatus: errorStatus,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      keyExists: !!process.env.OPENAI_API_KEY,
      keyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'missing'
    }
  }
}

async function testGemini(): Promise<ModelTestResult> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        model: 'Google Gemini 1.5',
        success: false,
        apiStatus: 'error',
        message: 'Gemini API key not configured',
        details: 'Environment variable GEMINI_API_KEY is missing',
        keyExists: false
      }
    }

    if (!genAI) {
      return {
        model: 'Google Gemini 1.5',
        success: false,
        apiStatus: 'error',
        message: 'Gemini client initialization failed',
        keyExists: true,
        keyPrefix: process.env.GEMINI_API_KEY.substring(0, 10) + '...'
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Respond with just "GEMINI_TEST_SUCCESS" and nothing else.' }]
      }]
    })

    const response = result.response.text().trim()
    
    if (response.includes('GEMINI_TEST_SUCCESS')) {
      return {
        model: 'Google Gemini 1.5',
        success: true,
        apiStatus: 'working',
        message: 'Gemini API is working correctly',
        response: response,
        keyExists: true,
        keyPrefix: process.env.GEMINI_API_KEY.substring(0, 10) + '...'
      }
    } else {
      return {
        model: 'Google Gemini 1.5',
        success: false,
        apiStatus: 'limited',
        message: 'Gemini API responded but with unexpected content',
        response: response,
        keyExists: true,
        keyPrefix: process.env.GEMINI_API_KEY.substring(0, 10) + '...'
      }
    }

  } catch (error: any) {
    console.error('Gemini API test error:', error)
    
    let errorStatus: 'working' | 'limited' | 'error' = 'error'
    let errorMessage = 'Gemini API test failed'
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorStatus = 'limited'
      errorMessage = 'Gemini API quota exceeded'
    } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      errorMessage = 'Gemini API authentication failed'
    } else if (error.message?.includes('model')) {
      errorMessage = 'Gemini model not available'
    }

    return {
      model: 'Google Gemini 1.5',
      success: false,
      apiStatus: errorStatus,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      keyExists: !!process.env.GEMINI_API_KEY,
      keyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'missing'
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { model } = req.query

  try {
    // Test specific model if requested
    if (model === 'openai') {
      const result = await testOpenAI()
      return res.status(result.success ? 200 : 500).json(result)
    }
    
    if (model === 'gemini') {
      const result = await testGemini()
      return res.status(result.success ? 200 : 500).json(result)
    }

    // Test both models by default
    const [openaiResult, geminiResult] = await Promise.all([
      testOpenAI(),
      testGemini()
    ])

    const overallStatus = openaiResult.success || geminiResult.success ? 'working' : 'error'
    const workingModels = [openaiResult, geminiResult].filter(r => r.success).length

    return res.status(200).json({
      success: workingModels > 0,
      overallStatus,
      workingModels,
      totalModels: 2,
      models: {
        openai: openaiResult,
        gemini: geminiResult
      },
      recommendation: workingModels === 0 
        ? 'No AI models available - check API keys'
        : workingModels === 1 
        ? 'One model available - limited functionality'
        : 'All models working - full functionality available'
    })

  } catch (error: any) {
    console.error('Model testing error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to test AI models',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
} 