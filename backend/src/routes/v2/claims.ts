import { Router } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.js'
import { createClaim, listUserClaims } from '../../services/v2/claims.js'

const router = Router()

/**
 * POST /api/v2/claims
 * Create a new reward claim for the authenticated user.
 *
 * Body:   { rewardId: string }
 * Response: { claim }
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { rewardId } = req.body as { rewardId?: string }
    if (!rewardId || typeof rewardId !== 'string') {
      return res.status(400).json({ error: 'rewardId is required' })
    }

    const claim = await createClaim(req.user!.id, rewardId)
    res.status(201).json({ claim })
  } catch (err: any) {
    console.error('V2 claim error:', err)
    res.status(err.status || 500).json({ error: err.message || 'Failed to create claim' })
  }
})

/**
 * GET /api/v2/claims
 * List all claims for the authenticated user.
 *
 * Response: { claims: V2Claim[] }
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const claims = await listUserClaims(req.user!.id)
    res.json({ claims })
  } catch (err) {
    console.error('V2 list claims error:', err)
    res.status(500).json({ error: 'Failed to retrieve claims' })
  }
})

export default router
