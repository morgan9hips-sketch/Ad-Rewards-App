import { Router, Request, Response } from 'express'

const router = Router()

/**
 * V2 Health Check
 * GET /api/v2/health
 *
 * Simple health check for V2 API namespace.
 * Useful for monitoring and load balancer checks.
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    ok: true,
    version: 'v2',
    timestamp: new Date().toISOString(),
  })
})

export default router
