import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured',
        apiStatus: 'error',
        details: 'Environment variable GEMINI_API_KEY is missing',
        keyExists: false
      })
    }

    console.log('Testing Gemini API with key:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...')

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    if (!genAI) {
      return res.status(500).json({
        error: 'Failed to initialize Gemini client',
        apiStatus: 'error',
        details: 'GoogleGenerativeAI constructor failed',
        keyExists: true,
        keyPrefix: process.env.GEMINI_API_KEY.substring(0, 10) + '...'
      })
    }

    // Test with a simple API call
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Respond with just "GEMINI_TEST_SUCCESS" and nothing else.' }]
      }]
    })

    const response = result.response.text().trim()
    console.log('Gemini API response:', response)
    
    if (response.includes('GEMINI_TEST_SUCCESS')) {
      return res.status(200).json({
        success: true,
        apiStatus: 'working',
        message: 'Gemini API is working correctly',
        model: 'gemini-1.5-flash',
        response: response,
        keyExists: true,
        keyPrefix: process.env.GEMINI_API_KEY.substring(0, 10) + '...'
      })
    } else {
      return res.status(200).json({
        success: false,
        apiStatus: 'limited',
        message: 'Gemini API responded but with unexpected content',
        response: response,
        keyExists: true,
        keyPrefix: process.env.GEMINI_API_KEY.substring(0, 10) + '...'
      })
    }

  } catch (error: any) {
    console.error('Gemini API test error:', error)
    
    let errorStatus = 'error'
    let errorMessage = 'Gemini API test failed'
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorStatus = 'limited'
      errorMessage = 'Gemini API quota exceeded'
    } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      errorMessage = 'Gemini API authentication failed'
    } else if (error.message?.includes('model')) {
      errorMessage = 'Gemini model not available'
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      errorMessage = 'Gemini API key permissions denied'
    } else if (error.message?.includes('INVALID_ARGUMENT')) {
      errorMessage = 'Invalid request to Gemini API'
    }

    return res.status(500).json({
      success: false,
      apiStatus: errorStatus,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      fullError: process.env.NODE_ENV === 'development' ? error : undefined,
      keyExists: !!process.env.GEMINI_API_KEY,
      keyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'missing'
    })
  }
} 