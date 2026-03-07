import { Request, Response, NextFunction } from 'express'

/**
 * V2 Feature Flag Middleware
 *
 * Checks if V2 endpoints are enabled via environment variable.
 * If V2_ENABLE=false, returns 404 Not Found.
 * If V2_ENABLE=true (or not set, defaults to true), allows request to proceed.
 */
export function v2FeatureFlag(req: Request, res: Response, next: NextFunction) {
  const v2Enabled = process.env.V2_ENABLE !== 'false' // Default to true if not explicitly set to 'false'

  if (!v2Enabled) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'V2 API is currently disabled',
    })
  }

  next()
}
