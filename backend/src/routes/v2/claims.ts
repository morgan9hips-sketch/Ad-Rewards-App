import { Router, Request, Response } from 'express'
import { createClaim, fulfillClaim } from '../../services/v2/claims.js'

const router = Router()

/**
 * POST /api/v2/claims
 *
 * Creates a new V2 claim with status='pending'.
 *
 * Body:
 *   userId       string  – claimant user id
 *   amountCoins  number  – coin amount to claim (positive integer)
 *   description? string  – human-readable note
 *   metadata?    object  – arbitrary key/value payload
 */
router.post('/', async (req: Request, res: Response) => {
  const { userId, amountCoins, description, metadata } = req.body

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' })
  }
  if (!amountCoins || typeof amountCoins !== 'number' || amountCoins <= 0) {
    return res.status(400).json({ error: 'amountCoins must be a positive number' })
  }

  try {
    const claim = await createClaim({
      userId,
      amountCoins: BigInt(amountCoins),
      description,
      metadata,
    })
    res.status(201).json({
      ...claim,
      amountCoins: claim.amountCoins.toString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: 'Failed to create claim', detail: message })
  }
})

/**
 * POST /api/v2/claims/:id/fulfill
 *
 * Fulfills a pending claim.
 *
 * Atomically:
 *   1. Creates a debit ledger entry for the claim amount.
 *   2. Transitions the claim from 'pending' to 'fulfilled'.
 *
 * Returns 409 if the claim is not in 'pending' status.
 */
router.post('/:id/fulfill', async (req: Request, res: Response) => {
  const claimId = parseInt(req.params.id, 10)
  if (isNaN(claimId)) {
    return res.status(400).json({ error: 'Invalid claim id' })
  }

  try {
    const claim = await fulfillClaim(claimId)
    res.json({
      ...claim,
      amountCoins: claim.amountCoins.toString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fulfill claim'
    if (
      message.includes('not found') ||
      message.includes('cannot be fulfilled')
    ) {
      return res.status(409).json({ error: message })
    }
    res.status(500).json({ error: 'Unexpected error while fulfilling claim', detail: message })
  }
})

export default router
