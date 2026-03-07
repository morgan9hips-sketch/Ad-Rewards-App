import { Router } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.js'
import { getV2Balance } from '../../services/v2/ledger.js'

const router = Router()

/**
 * GET /api/v2/wallet
 * Returns the authenticated user's current V2 coin balance.
 *
 * Response: { userId, balanceCoins: string }
 * (BigInt serialised as a decimal string)
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const balanceCoins = await getV2Balance(userId)
    res.json({ userId, balanceCoins: balanceCoins.toString() })
  } catch (err) {
    console.error('V2 wallet error:', err)
    res.status(500).json({ error: 'Failed to retrieve wallet balance' })
  }
})

export default router
