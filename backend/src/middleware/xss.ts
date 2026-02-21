import { Request, Response, NextFunction } from 'express'

/**
 * Escape HTML entities to prevent XSS attacks
 */
function escapeHtml(str: string): string {
  if (typeof str !== 'string') return str
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return escapeHtml(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, any> = {}
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key])
    }
    return sanitized
  }
  return obj
}

/**
 * Middleware: sanitize request body to prevent XSS
 */
export function xssSanitize(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }
  next()
}

/**
 * Middleware: set security response headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent browsers from MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Enable XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Strict Transport Security (HTTPS only)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      "font-src 'self' data:",
      "frame-src 'none'",
    ].join('; ')
  )

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  next()
}
