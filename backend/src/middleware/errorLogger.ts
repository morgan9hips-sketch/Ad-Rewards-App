import { Request, Response, NextFunction } from 'express'

/**
 * Error categories for better debugging
 */
const ERROR_CATEGORIES: Record<string, string> = {
  VALIDATION: 'Validation Error',
  AUTH: 'Authentication Error',
  NOT_FOUND: 'Not Found',
  RATE_LIMIT: 'Rate Limit Exceeded',
  DATABASE: 'Database Error',
  EXTERNAL: 'External Service Error',
  INTERNAL: 'Internal Server Error',
}

function categorizeError(err: any): string {
  if (err.code === 'P2002' || err.code?.startsWith('P')) return 'DATABASE'
  if (err.status === 401 || err.status === 403) return 'AUTH'
  if (err.status === 404) return 'NOT_FOUND'
  if (err.status === 429) return 'RATE_LIMIT'
  if (err.status === 400) return 'VALIDATION'
  if (err.name === 'ValidationError') return 'VALIDATION'
  return 'INTERNAL'
}

/**
 * Express error logging middleware
 */
export function errorLogger(err: any, req: Request, res: Response, next: NextFunction) {
  const category = categorizeError(err)
  const isDev = process.env.NODE_ENV !== 'production'

  console.error(`[${new Date().toISOString()}] ❌ ${ERROR_CATEGORIES[category]}:`, {
    method: req.method,
    path: req.path,
    status: err.status || 500,
    message: err.message,
    ...(isDev && { stack: err.stack }),
  })

  const status = err.status || 500

  const response: Record<string, any> = {
    error: ERROR_CATEGORIES[category] || 'Internal Server Error',
    message: status < 500
      ? err.message
      : 'An unexpected error occurred. Please try again later.',
    code: `${category}_ERROR`,
  }

  if (isDev && err.stack) {
    response.details = err.message
  }

  res.status(status).json(response)
}

/**
 * Async route wrapper - catches errors and passes them to next()
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
