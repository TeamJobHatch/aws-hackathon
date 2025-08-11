// API Helper utilities for improved error handling and rate limiting

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  status?: number
  retryAfter?: number
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
}

// Sleep function for delays
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

// Calculate exponential backoff delay
const calculateBackoffDelay = (attempt: number, config: RetryConfig): number => {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1)
  return Math.min(delay + Math.random() * 1000, config.maxDelay) // Add jitter
}

// Enhanced fetch with retry logic and error handling
export async function retryFetch(
  url: string, 
  options: RequestInit = {}, 
  retryConfig: Partial<RetryConfig> = {}
): Promise<APIResponse<any>> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      console.log(`🔄 API Request attempt ${attempt}/${config.maxRetries}: ${url}`)
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'JobHatch-HR-Analyzer/1.0',
          'Accept': 'application/json',
          ...options.headers
        }
      })

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after')
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : calculateBackoffDelay(attempt, config)
        
        console.log(`⏰ Rate limited, waiting ${delay}ms before retry`)
        await sleep(delay)
        continue
      }

      // Handle other HTTP errors
      if (!response.ok) {
        if (response.status >= 500 && attempt < config.maxRetries) {
          console.log(`🔄 Server error ${response.status}, retrying...`)
          await sleep(calculateBackoffDelay(attempt, config))
          continue
        }

        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        }
      }

      // Success - parse response
      const data = await response.json()
      console.log(`✅ API Request successful on attempt ${attempt}`)
      
      return {
        success: true,
        data,
        status: response.status
      }

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      console.log(`❌ API Request failed on attempt ${attempt}: ${lastError.message}`)

      if (attempt < config.maxRetries) {
        await sleep(calculateBackoffDelay(attempt, config))
      }
    }
  }

  return {
    success: false,
    error: `Max retries exceeded. Last error: ${lastError?.message || 'Unknown error'}`
  }
}

// GitHub API specific helper
export async function githubAPIRequest(
  endpoint: string, 
  options: RequestInit = {}
): Promise<APIResponse<any>> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'JobHatch-HR-Analyzer'
  }

  // Add GitHub token if available
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  }

  return retryFetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  }, {
    maxRetries: 3,
    baseDelay: 2000 // GitHub rate limits are more strict
  })
}

// LinkedIn URL validation
export function validateLinkedInURL(url: string): { valid: boolean; error?: string; username?: string } {
  try {
    const urlObj = new URL(url)
    
    if (!urlObj.hostname.includes('linkedin.com')) {
      return { valid: false, error: 'URL must be from linkedin.com' }
    }

    // Extract username from various LinkedIn URL formats
    const patterns = [
      /\/in\/([^\/\?]+)/,           // /in/username
      /\/pub\/([^\/\?]+)/,          // /pub/username  
      /\/profile\/view\?id=([^&]+)/ // legacy format
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        const username = match[1]
        if (username && username.length > 0) {
          return { valid: true, username }
        }
      }
    }

    return { valid: false, error: 'Could not extract username from LinkedIn URL' }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

// GitHub username validation
export function validateGitHubUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length === 0) {
    return { valid: false, error: 'Username cannot be empty' }
  }

  if (username.length > 39) {
    return { valid: false, error: 'Username cannot be longer than 39 characters' }
  }

  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain alphanumeric characters and hyphens' }
  }

  if (username.startsWith('-') || username.endsWith('-')) {
    return { valid: false, error: 'Username cannot start or end with a hyphen' }
  }

  if (username.includes('--')) {
    return { valid: false, error: 'Username cannot contain consecutive hyphens' }
  }

  return { valid: true }
}

// Data sanitization helper
export function sanitizeData<T>(data: any, schema: Record<string, any>): T {
  const sanitized: any = {}
  
  for (const [key, validator] of Object.entries(schema)) {
    if (data[key] !== undefined) {
      if (typeof validator === 'function') {
        sanitized[key] = validator(data[key])
      } else if (typeof validator === 'object' && validator.type) {
        switch (validator.type) {
          case 'string':
            sanitized[key] = String(data[key]).substring(0, validator.maxLength || 1000)
            break
          case 'number':
            const num = Number(data[key])
            sanitized[key] = isNaN(num) ? validator.default || 0 : 
              Math.min(Math.max(num, validator.min || 0), validator.max || 100)
            break
          case 'boolean':
            sanitized[key] = Boolean(data[key])
            break
          case 'array':
            sanitized[key] = Array.isArray(data[key]) ? 
              data[key].slice(0, validator.maxItems || 100) : []
            break
          default:
            sanitized[key] = data[key]
        }
      } else {
        sanitized[key] = data[key]
      }
    } else if (schema[key].required) {
      sanitized[key] = schema[key].default || null
    }
  }
  
  return sanitized as T
}

// Error response formatter
export function formatErrorResponse(error: any, context: string) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return {
    error: `${context} failed`,
    details: isDevelopment ? (error instanceof Error ? error.message : String(error)) : 'Internal error',
    timestamp: new Date().toISOString(),
    context
  }
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string, 
  limit: number = 100, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const existing = rateLimitStore.get(key)
  
  if (!existing || now > existing.resetTime) {
    const resetTime = now + windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: limit - 1, resetTime }
  }
  
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime }
  }
  
  existing.count++
  rateLimitStore.set(key, existing)
  return { allowed: true, remaining: limit - existing.count, resetTime: existing.resetTime }
}

// Cleanup old rate limit entries
setInterval(() => {
  const now = Date.now()
  // Convert entries to array to fix TypeScript iteration issue
  const entries = Array.from(rateLimitStore.entries())
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Cleanup every minute


