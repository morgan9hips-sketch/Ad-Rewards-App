import { Request, Response, NextFunction } from 'express'

/**
 * V2 feature flag middleware.
 *
 * Gates all V2 routes behind the `REWARDS_V2_ENABLED` environment variable.
 * - When `REWARDS_V2_ENABLED=false`  → responds 404 (routes appear non-existent).
 * - Any other value (or missing)     → routes are active.
 */
export function v2FeatureFlag(req: Request, res: Response, next: NextFunction): void {
  if (process.env.REWARDS_V2_ENABLED === 'false') {
    res.status(404).json({ error: 'V2 API is not enabled on this instance' })
    return
  }
  next()
}
