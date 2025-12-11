/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null

  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(sanitized)) return null
  if (sanitized.length > 254) return null // RFC 5321

  return sanitized
}

/**
 * Validate and sanitize phone number
 * Returns phone in E.164 format (e.g., +15551234567)
 */
export function sanitizePhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') return null

  const trimmed = phone.trim()

  // Check if it starts with +
  const hasPlus = trimmed.startsWith('+')

  // Remove all non-numeric characters except the leading +
  const digitsOnly = trimmed.replace(/[^\d+]/g, '').replace(/\+/g, '')

  // Check if it's a valid length (10-15 digits for international numbers)
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return null

  // Return in E.164 format with +
  return `+${digitsOnly}`
}

/**
 * Validate student name
 */
export function validateStudentName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' }
  }

  const trimmed = name.trim()

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' }
  }

  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' }
  }

  return { valid: true }
}

/**
 * Validate UUID
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Validate date string (YYYY-MM-DD format)
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateStr)) return false

  const date = new Date(dateStr + 'T12:00:00.000Z')
  return !isNaN(date.getTime())
}

/**
 * Validate message/notes input
 */
export function validateMessage(message: string): { valid: boolean; sanitized: string; error?: string } {
  if (!message) {
    return { valid: true, sanitized: '' }
  }

  if (typeof message !== 'string') {
    return { valid: false, sanitized: '', error: 'Invalid message format' }
  }

  const sanitized = sanitizeString(message)

  if (sanitized.length > 500) {
    return { valid: false, sanitized: '', error: 'Message must be less than 500 characters' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate time block name
 */
export function validateTimeBlockName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Time block name is required' }
  }

  const trimmed = name.trim()

  if (trimmed.length < 1) {
    return { valid: false, error: 'Time block name cannot be empty' }
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Time block name must be less than 50 characters' }
  }

  return { valid: true }
}

/**
 * Rate limiting token bucket
 */
const rateLimitStore = new Map<string, { tokens: number; lastRefill: number }>()

export function checkRateLimit(
  identifier: string,
  maxTokens: number = 5,
  refillRate: number = 1,
  refillInterval: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const bucket = rateLimitStore.get(identifier) || { tokens: maxTokens, lastRefill: now }

  // Refill tokens based on time passed
  const timePassed = now - bucket.lastRefill
  const tokensToAdd = Math.floor(timePassed / refillInterval) * refillRate

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now
  }

  // Check if request is allowed
  if (bucket.tokens > 0) {
    bucket.tokens--
    rateLimitStore.set(identifier, bucket)
    return { allowed: true, remaining: bucket.tokens }
  }

  rateLimitStore.set(identifier, bucket)
  return { allowed: false, remaining: 0 }
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  const maxAge = 3600000 // 1 hour

  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.lastRefill > maxAge) {
      rateLimitStore.delete(key)
    }
  }
}
