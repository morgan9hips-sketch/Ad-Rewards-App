import { Request, Response, NextFunction } from 'express'

/**
 * Validation helper functions
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

export function isValidPayPalEmail(email: string): boolean {
  return isValidEmail(email)
}

export function isPositiveNumber(value: any): boolean {
  const num = Number(value)
  return !isNaN(num) && num > 0
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

export function isValidStringLength(str: string, min: number, max: number): boolean {
  return typeof str === 'string' && str.length >= min && str.length <= max
}

export function isValidEnum(value: string, allowed: string[]): boolean {
  return allowed.includes(value)
}

export function isValidDate(value: any): boolean {
  const date = new Date(value)
  return !isNaN(date.getTime())
}

export function isValidCurrencyCode(code: string): boolean {
  const validCodes = ['USD', 'GBP', 'ZAR', 'CAD', 'AUD', 'INR', 'NGN', 'EUR', 'BRL', 'MXN']
  return validCodes.includes(code)
}

/**
 * Sanitize a string to prevent XSS
 */
export function sanitizeString(str: string): string {
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
 * Middleware: validate pagination query params
 */
export function validatePagination(req: Request, res: Response, next: NextFunction) {
  const page = parseInt(req.query.page as string)
  const perPage = parseInt(req.query.perPage as string)

  if (req.query.page !== undefined && (isNaN(page) || page < 1)) {
    return res.status(400).json({ error: 'Invalid page parameter. Must be a positive integer.' })
  }
  if (req.query.perPage !== undefined && (isNaN(perPage) || perPage < 1 || perPage > 100)) {
    return res.status(400).json({ error: 'Invalid perPage parameter. Must be between 1 and 100.' })
  }

  next()
}

/**
 * Middleware: validate profile update body
 */
export function validateProfileUpdate(req: Request, res: Response, next: NextFunction) {
  const { email, paypalEmail, preferredCurrency } = req.body

  if (email !== undefined && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' })
  }
  if (paypalEmail !== undefined && paypalEmail !== '' && !isValidPayPalEmail(paypalEmail)) {
    return res.status(400).json({ error: 'Invalid PayPal email address format.' })
  }
  if (preferredCurrency !== undefined && !isValidCurrencyCode(preferredCurrency)) {
    return res.status(400).json({ error: `Invalid currency code. Supported: USD, GBP, ZAR, EUR, CAD, AUD.` })
  }

  next()
}
