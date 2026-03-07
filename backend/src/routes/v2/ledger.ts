import { Router, Request, Response } from 'express'
import { creditLedger, getV2Balance } from '../../services/v2/ledger.js'

const router = Router()

/**
 * GET /api/v2/ledger/balance/:userId
 *
 * Returns the computed V2 balance for a user.
 * Balance = SUM(credits) - SUM(debits) from v2_ledger_entries.
 * There is no stored balance column; it is always derived.
 */
router.get('/balance/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  try {
    const balanceCoins = await getV2Balance(userId)
    res.json({ userId, balanceCoins: balanceCoins.toString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: 'Failed to compute balance', detail: message })
  }
})

/**
 * POST /api/v2/ledger/credit
 *
 * Credits a user's V2 ledger.
 *
 * Body:
 *   userId          string  – target user
 *   amountCoins     number  – coins to credit (positive integer)
 *   idempotencyKey  string  – unique provider event id / admin action id
 *   referenceId?    string  – optional reference (e.g. ad impression id)
 *   referenceType?  string  – optional type label
 *   description?    string  – human-readable note
 *
 * Idempotency: if `idempotencyKey` has already been used, the existing
 * entry is returned with HTTP 200 and `created: false`. No duplicate row
 * is written.
 */
router.post('/credit', async (req: Request, res: Response) => {
  const {
    userId,
    amountCoins,
    idempotencyKey,
    referenceId,
    referenceType,
    description,
  } = req.body

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' })
  }
  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return res.status(400).json({ error: 'idempotencyKey is required' })
  }
  if (!amountCoins || typeof amountCoins !== 'number' || amountCoins <= 0) {
    return res.status(400).json({ error: 'amountCoins must be a positive number' })
  }

  try {
    const result = await creditLedger({
      userId,
      amountCoins: BigInt(amountCoins),
      idempotencyKey,
      referenceId,
      referenceType,
      description,
    })
    const status = result.created ? 201 : 200
    res.status(status).json({
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
