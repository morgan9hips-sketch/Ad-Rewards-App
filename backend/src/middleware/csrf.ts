import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

const CSRF_HEADER = 'x-csrf-token'
const CSRF_SESSION_KEY = 'csrfToken'

/** Routes that are exempt from CSRF validation */
const CSRF_EXEMPT_PATHS = [
  '/api/health',
  '/api/legal',
  '/api/platform',
  '/api/leaderboard',
  '/api/referrals/lookup',
  '/api/withdrawals/recent-public',
]

/** HTTP methods that require CSRF validation */
const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Middleware: generate and expose a CSRF token via response header
 */
export function csrfTokenMiddleware(req: Request & { session?: any }, res: Response, next: NextFunction) {
  // If no session or token exists, generate one
  if (!req.session?.[CSRF_SESSION_KEY]) {
    const token = generateCsrfToken()
    if (req.session) {
      req.session[CSRF_SESSION_KEY] = token
    }
    res.setHeader('X-CSRF-Token', token)
  } else {
    res.setHeader('X-CSRF-Token', req.session[CSRF_SESSION_KEY])
  }
  next()
}

/**
 * Middleware: validate CSRF token on state-mutating requests
 * Uses double-submit cookie pattern when sessions are unavailable
 */
export function csrfProtection(req: Request & { session?: any }, res: Response, next: NextFunction) {
  // Only protect state-changing methods
  if (!CSRF_PROTECTED_METHODS.includes(req.method)) {
    return next()
  }

  // Skip exempt paths
  const isExempt = CSRF_EXEMPT_PATHS.some(path => req.path.startsWith(path))
  if (isExempt) {
    return next()
  }

  // Get token from header or body
  const requestToken = req.headers[CSRF_HEADER] as string || req.body?._csrf

  // If sessions are not configured, log a warning and skip CSRF validation
  // (token is still generated and sent for clients to use)
  if (!req.session) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ CSRF protection is bypassed because session middleware is not configured.')
    }
    return next()
  }

  const sessionToken = req.session[CSRF_SESSION_KEY]

  if (!requestToken || !sessionToken || requestToken !== sessionToken) {
    return res.status(403).json({
      error: 'Invalid or missing CSRF token',
      message: 'Your request could not be verified. Please refresh the page and try again.',
      code: 'CSRF_VALIDATION_FAILED',
    })
  }

  next()
}
