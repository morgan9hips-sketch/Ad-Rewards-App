import { Router, Request, Response } from 'express'
import { creditLedger, V2LedgerEntryType } from '../../services/v2/ledger.js'

const router = Router()

/**
 * POST /api/v2/admin/credit
 *
 * Admin-only endpoint to credit a user's V2 ledger.
 * Authenticated via V2_ADMIN_TOKEN in Authorization: Bearer <token>.
 *
 * Body:
 *   userId          string  – target user
 *   amountCoins     number  – coins to credit (positive integer)
 *   idempotencyKey  string  – unique key to prevent double-credits
 *   notes?          string  – optional admin notes
 */
router.post('/credit', async (req: Request, res: Response) => {
  // Verify admin token (simple bearer token, not Supabase JWT)
  const authHeader = req.headers.authorization
  const adminToken = process.env.V2_ADMIN_TOKEN
  if (!adminToken || !authHeader || authHeader !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { userId, amountCoins, idempotencyKey, notes } = req.body

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' })
  }
  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return res.status(400).json({ error: 'idempotencyKey is required' })
  }
  if (typeof amountCoins !== 'number' || amountCoins <= 0 || !Number.isInteger(amountCoins)) {
    return res.status(400).json({ error: 'amountCoins must be a positive integer' })
  }

  try {
    const result = await creditLedger({
      userId,
      amountCoins: BigInt(amountCoins),
      type: V2LedgerEntryType.ADMIN_CREDIT,
      idempotencyKey,
      description: notes,
    })
    const status = result.created ? 201 : 200
    res.status(status).json({
      ok: true,
      created: result.created,
      entry: {
        ...result.entry,
        amountCoins: result.entry.amountCoins.toString(),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: 'Failed to record credit', detail: message })
  }
})

export default router
