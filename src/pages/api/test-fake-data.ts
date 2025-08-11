import { NextApiRequest, NextApiResponse } from 'next'
import { fakeJobDescriptions, fakeResumes, generateFakeAnalysis, getFakeAnalysisSummary } from '@/utils/fakeData'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type = 'all', model = 'openai' } = req.query

  try {
    switch (type) {
      case 'jobs':
        return res.status(200).json({
          success: true,
          type: 'job_descriptions',
          count: fakeJobDescriptions.length,
          data: fakeJobDescriptions
        })

      case 'resumes':
        return res.status(200).json({
          success: true,
          type: 'resumes',
          count: fakeResumes.length,
          data: fakeResumes
        })

      case 'analysis':
        // Generate a new fake analysis with the specified model
        const sampleJob = fakeJobDescriptions[0]
        const sampleAnalysis = generateFakeAnalysis(
          'Test Candidate',
          sampleJob.title,
          model as 'openai' | 'gemini'
        )
        
        return res.status(200).json({
          success: true,
          type: 'analysis_sample',
          model: model,
          jobTitle: sampleJob.title,
          analysis: sampleAnalysis
        })

      case 'demo':
        // Create a complete demo scenario
        const demoJob = fakeJobDescriptions[0]
        const demoResumes = fakeResumes.map(resume => ({
          ...resume,
          analysis: generateFakeAnalysis(
            resume.candidateName,
            demoJob.title,
            model as 'openai' | 'gemini'
          )
        }))
        
        const summary = getFakeAnalysisSummary(demoResumes)
        
        return res.status(200).json({
          success: true,
          type: 'complete_demo',
          model: model,
          jobDescription: demoJob,
          candidates: demoResumes,
          summary: summary,
          metadata: {
            totalCandidates: demoResumes.length,
            avgProcessingTime: summary.processingTime / demoResumes.length,
            topScore: Math.max(...demoResumes.map(r => r.analysis?.matchPercentage || 0))
          }
        })

      default:
        return res.status(200).json({
          success: true,
          type: 'overview',
          availableData: {
            jobDescriptions: fakeJobDescriptions.length,
            resumes: fakeResumes.length,
            supportedModels: ['openai', 'gemini']
          },
          endpoints: {
            jobs: '/api/test-fake-data?type=jobs',
            resumes: '/api/test-fake-data?type=resumes',
            analysis: '/api/test-fake-data?type=analysis&model=openai',
            demo: '/api/test-fake-data?type=demo&model=gemini'
          },
          models: {
            openai: {
              name: 'OpenAI GPT-4o',
              confidence: '95%',
              processingTime: '2-4 seconds'
            },
            gemini: {
              name: 'Google Gemini 2.5',
              confidence: '90%',
              processingTime: '1-3 seconds'
            }
          }
        })
    }

  } catch (error) {
    console.error('Test fake data error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to generate test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 