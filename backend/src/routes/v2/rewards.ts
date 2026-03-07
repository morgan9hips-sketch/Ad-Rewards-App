import { Router } from 'express'
import { listActiveRewards } from '../../services/v2/rewards.js'

const router = Router()

/**
 * GET /api/v2/rewards
 * Public endpoint – returns the active reward catalog.
 *
 * Response: { rewards: V2Reward[] }
 */
router.get('/', async (_req, res) => {
  try {
    const rewards = await listActiveRewards()
    res.json({ rewards })
  } catch (err) {
    console.error('V2 rewards error:', err)
    res.status(500).json({ error: 'Failed to retrieve rewards' })
  }
})

export default router
