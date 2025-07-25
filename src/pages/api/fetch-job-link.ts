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
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    // For demo purposes, simulate fetching job data from URL
    // In a real implementation, you would:
    // 1. Fetch the webpage content
    // 2. Parse the HTML to extract job details
    // 3. Use AI to structure the information
    
    // Simulated response for demo
    const mockJobData = {
      title: 'Senior Frontend Developer',
      company: 'Tech Company Inc.',
      location: 'San Francisco, CA (Remote)',
      salary: '$120,000 - $160,000',
      description: 'We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building and maintaining user-facing web applications using modern JavaScript frameworks.',
      requirements: [
        '5+ years of experience with React or Vue.js',
        'Strong knowledge of JavaScript, HTML, and CSS',
        'Experience with modern build tools and CI/CD',
        'Familiarity with REST APIs and GraphQL',
        'Experience with testing frameworks'
      ],
      qualifications: [
        'Bachelor\'s degree in Computer Science or related field',
        'Experience with TypeScript',
        'Knowledge of cloud platforms (AWS, Azure, GCP)',
        'Experience with agile development methodologies'
      ],
      skills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js'],
      content: 'Senior Frontend Developer position at Tech Company Inc. Remote work available. We are seeking an experienced developer to build user-facing applications...'
    }

    // Add a delay to simulate real API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    res.status(200).json(mockJobData)
  } catch (error) {
    console.error('Fetch job link error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch job details. Please try manual entry.',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 