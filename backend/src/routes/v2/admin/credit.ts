import { Router } from 'express'
import { authenticate, AuthRequest } from '../../../middleware/auth.js'
import { requireAdmin } from '../../../middleware/requireAdmin.js'
import { adminCredit } from '../../../services/v2/ledger.js'
import { randomUUID } from 'crypto'

const router = Router()

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin)

/**
 * POST /api/v2/admin/credit
 * Credit coins to a user's V2 ledger.
 *
 * Body:
 *   userId          string   – target user ID
 *   amountCoins     number   – coins to credit (positive integer)
 *   idempotencyKey  string?  – optional caller-supplied idempotency key
 *   note            string?  – optional human-readable note
 *
 * Response: { entry }
 */
router.post('/credit', async (req: AuthRequest, res) => {
  try {
    const { userId, amountCoins, idempotencyKey, note } = req.body as {
      userId?: string
      amountCoins?: number
      idempotencyKey?: string
      note?: string
    }

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' })
    }
    if (amountCoins == null || typeof amountCoins !== 'number' || amountCoins <= 0 || !Number.isInteger(amountCoins)) {
      return res.status(400).json({ error: 'amountCoins must be a positive integer' })
    }

    const key = idempotencyKey ?? randomUUID()
    const entry = await adminCredit(userId, BigInt(amountCoins), key, note)

    res.status(201).json({ entry })
  } catch (err: any) {
    if (err.code === 'P2002') {
      // Unique constraint on idempotency_key → duplicate request
      return res.status(409).json({ error: 'Duplicate idempotency key – credit already applied' })
    }
    console.error('V2 admin credit error:', err)
    res.status(500).json({ error: 'Failed to apply credit' })
  }
})

export default router
