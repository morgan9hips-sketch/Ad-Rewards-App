import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../../middleware/auth.js'
import { getV2Balance } from '../../services/v2/ledger.js'

const router = Router()

/**
 * GET /api/v2/wallet
 *
 * Returns the authenticated user's V2 coin balance.
 * Balance = SUM(amount_coins) from v2_ledger_entries (positive=credit, negative=debit).
 * There is no stored balance column; it is always derived.
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id
  try {
    const balanceCoins = await getV2Balance(userId)
    res.json({ ok: true, balanceCoins: balanceCoins.toString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: 'Failed to compute balance', detail: message })
  }
})

export default router
