// Real-time progress logger for AI analysis
import React from 'react'

export interface ProgressLog {
  id: string
  message: string
  timestamp: number
  type: 'info' | 'success' | 'warning' | 'error'
  step: string
  data?: any
}

export interface AnalysisProgress {
  step: string
  progress: number
  status: 'pending' | 'active' | 'completed' | 'error'
  details: string
  logs: ProgressLog[]
}

class ProgressLogger {
  private logs: ProgressLog[] = []
  private currentStep: string = ''
  private listeners: ((log: ProgressLog) => void)[] = []

  constructor() {
    this.logs = []
  }

  // Add a log entry and notify listeners
  log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', data?: any) {
    const log: ProgressLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      timestamp: Date.now(),
      type,
      step: this.currentStep,
      data
    }

    this.logs.push(log)
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(log))
    
    // Keep only last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }

    return log
  }

  // Set current step
  setStep(step: string) {
    this.currentStep = step
    this.log(`Starting ${step}`, 'info')
  }

  // Add a listener for real-time updates
  addListener(listener: (log: ProgressLog) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Get all logs
  getLogs(): ProgressLog[] {
    return [...this.logs]
  }

  // Clear logs
  clear() {
    this.logs = []
    this.currentStep = ''
  }

  // Generate analysis steps with real-time tracking
  generateAnalysisSteps(candidateCount: number, jobRequirementsCount: number): AnalysisProgress[] {
    return [
      {
        step: 'parsing',
        progress: 0,
        status: 'pending',
        details: `Processing ${candidateCount} resume${candidateCount > 1 ? 's' : ''}...`,
        logs: []
      },
      {
        step: 'skill-matching',
        progress: 0,
        status: 'pending',
        details: 'Analyzing technical skills and experience alignment',
        logs: []
      },
      {
        step: 'linkedin-research',
        progress: 0,
        status: 'pending',
        details: 'Searching for candidate profiles and professional history',
        logs: []
      },
      {
        step: 'github-analysis',
        progress: 0,
        status: 'pending',
        details: 'Evaluating code repositories and contribution patterns',
        logs: []
      },
      {
        step: 'web-research',
        progress: 0,
        status: 'pending',
        details: 'Finding portfolios, personal websites, and additional information',
        logs: []
      },
      {
        step: 'score-generation',
        progress: 0,
        status: 'pending',
        details: 'Calculating match percentages and rankings',
        logs: []
      }
    ]
  }

  // Helper methods for common logging scenarios
  logResumeProcessing(candidateName: string, fileSize: number) {
    this.log(`📄 Processing resume for ${candidateName} (${Math.round(fileSize / 1024)}KB)`, 'info')
  }

  logSkillMatch(skill: string, found: boolean, confidence: number) {
    const emoji = found ? '✅' : '❌'
    this.log(`${emoji} ${skill}: ${found ? `Found (${confidence}% confidence)` : 'Not found'}`, found ? 'success' : 'warning')
  }

  logLinkedInAnalysis(candidateName: string, url: string, success: boolean) {
    const emoji = success ? '🔗' : '⚠️'
    this.log(`${emoji} LinkedIn analysis for ${candidateName}: ${success ? 'Profile found and analyzed' : 'Analysis limited'}`, success ? 'success' : 'warning')
  }

  logGitHubAnalysis(candidateName: string, username: string, repoCount: number, qualityScore: number) {
    this.log(`💻 GitHub analysis for ${candidateName} (@${username}): ${repoCount} repositories, ${qualityScore}% average quality`, 'success')
  }

  logError(message: string, error?: any) {
    this.log(`❌ Error: ${message}`, 'error', error)
  }

  logSuccess(message: string) {
    this.log(`✅ ${message}`, 'success')
  }

  logWarning(message: string) {
    this.log(`⚠️ ${message}`, 'warning')
  }

  // Generate insights during analysis
  logInsight(insight: string, type: 'technical' | 'professional' | 'risk' = 'technical') {
    const emoji = type === 'risk' ? '🚨' : type === 'professional' ? '👤' : '🔧'
    this.log(`${emoji} Insight: ${insight}`, 'info')
  }
}

// Export singleton instance
export const progressLogger = new ProgressLogger()

// Browser-side hook for React components
export function useProgressLogger() {
  const [logs, setLogs] = React.useState<ProgressLog[]>([])

  React.useEffect(() => {
    const unsubscribe = progressLogger.addListener((log) => {
      setLogs(prevLogs => [...prevLogs, log])
    })

    // Initialize with existing logs
    setLogs(progressLogger.getLogs())

    return unsubscribe
  }, [])

  return {
    logs,
    clearLogs: () => {
      progressLogger.clear()
      setLogs([])
    }
  }
}

// Utility to format timestamps
export function formatLogTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}
