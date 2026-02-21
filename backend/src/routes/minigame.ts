import { Router } from 'express'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

/**
 * POST /api/minigame/complete
 * Placeholder endpoint for minigame completion.
 * Full reward logic (coins, daily limits, revenue split) will be added in Phase 2.
 */
router.post('/complete', async (req: AuthRequest, res) => {
  try {
    const { score, gameType } = req.body

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        success: false,
        error: 'A valid score is required',
      })
    }

    if (!gameType) {
      return res.status(400).json({
        success: false,
        error: 'gameType is required',
      })
    }

    // Phase 2 will add: coin rewards, daily limits, revenue split, transactions
    res.json({
      success: true,
      score,
      gameType,
      message: 'Game completed! Rewards coming in Phase 2.',
    })
  } catch (error: any) {
    console.error('Error completing minigame:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process game completion',
    })
  }
})

export default router
