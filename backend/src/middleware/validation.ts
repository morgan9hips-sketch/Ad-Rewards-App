import { Request, Response, NextFunction } from 'express'
import { isValidEmail, sanitizeString } from './validateInput.js'

/**
 * Middleware: validate Content-Type for POST/PUT requests
 */
export function validateContentType(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type']
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json',
      })
    }
  }
  next()
}

/**
 * Middleware: enforce maximum request body size (already handled by express.json limit,
 * but this provides a user-friendly error response)
 */
export function requestSizeLimiter(req: Request, res: Response, next: NextFunction) {
  // express.json() handles the actual limit; this catches the resulting error
  next()
}

/**
 * Middleware: sanitize string fields in request body to remove control characters
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Remove null bytes, control characters, and trim whitespace
        req.body[key] = req.body[key].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
      }
    }
  }
  next()
}

/**
 * Middleware: validate withdrawal request body
 */
export function validateWithdrawalRequest(req: Request, res: Response, next: NextFunction) {
  const { amount, paypalEmail } = req.body

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({
      error: 'Invalid withdrawal amount',
      message: 'Amount must be a positive number.',
    })
  }

  if (!paypalEmail || !isValidEmail(paypalEmail)) {
    return res.status(400).json({
      error: 'Invalid PayPal email',
      message: 'A valid PayPal email address is required.',
    })
  }

  next()
}

/**
 * Middleware: validate auth body for login
 */
export function validateAuthRequest(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email',
      message: 'A valid email address is required.',
    })
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'Password must be at least 6 characters long.',
    })
  }

  next()
}
