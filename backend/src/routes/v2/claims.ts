import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../../middleware/auth.js'
import { createClaim, fulfillClaim, V2ClaimStatus } from '../../services/v2/claims.js'

const router = Router()
const prisma = new PrismaClient()

/**
 * POST /api/v2/claims
 *
 * Creates a new V2 claim with status=PENDING for the authenticated user.
 * The coin cost is derived from the referenced V2Reward's costCoins.
 * No debit is made on claim creation; debit happens on fulfillment.
 *
 * Body:
 *   rewardId  string | number  – id of the V2Reward to claim
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id
  const { rewardId } = req.body

  const parsedRewardId = typeof rewardId === 'string' ? parseInt(rewardId, 10) : rewardId
  if (!parsedRewardId || typeof parsedRewardId !== 'number' || isNaN(parsedRewardId)) {
    return res.status(400).json({ error: 'rewardId is required' })
  }

  try {
    const reward = await prisma.v2Reward.findUnique({ where: { id: parsedRewardId } })
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' })
    }
    if (!reward.isActive) {
      return res.status(400).json({ error: 'Reward is not active' })
    }

    const claim = await createClaim({
      userId,
      amountCoins: BigInt(reward.costCoins),
      rewardId: reward.id,
    })
    res.status(201).json({
      ok: true,
      claim: {
        ...claim,
        amountCoins: claim.amountCoins.toString(),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: 'Failed to create claim', detail: message })
  }
})

/**
 * POST /api/v2/claims/:id/fulfill
 *
 * Fulfills a PENDING claim.
 *
 * Atomically:
 *   1. Creates a REDEEM debit ledger entry for the claim amount.
 *   2. Transitions the claim from PENDING to FULFILLED.
 *
 * Body (optional):
 *   fulfillmentRef? string – external reference (e.g. gift card code)
 *   notes?          string – admin notes
 *
 * Returns 409 if the claim is not in PENDING status.
 */
router.post('/:id/fulfill', async (req: AuthRequest, res: Response) => {
  const claimId = parseInt(req.params.id, 10)
  if (isNaN(claimId)) {
    return res.status(400).json({ error: 'Invalid claim id' })
  }

  const { fulfillmentRef, notes } = req.body

  try {
    const claim = await fulfillClaim(claimId, fulfillmentRef, notes)
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

export { V2ClaimStatus }
export default router
