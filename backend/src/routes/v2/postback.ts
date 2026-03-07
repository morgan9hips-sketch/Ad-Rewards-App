import { Router, Request, Response } from 'express'
import { PrismaClient, V2LedgerEntryType } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

/**
 * POST /api/v2/postback/ayet
 *
 * Handles Ayet postback callbacks for approved task completions.
 * Credits user coins via V2 ledger. Idempotent: duplicate transaction IDs
 * are rejected by the unique idempotency_key constraint.
 *
 * NOTE: Signature verification (TODO) should be added before going live.
 */
router.post('/ayet', async (req: Request, res: Response) => {
  try {
    const { user_id, transaction_id, revenue, status } = req.body

    // TODO: Verify HMAC/signature from Ayet before processing

    if (status !== 'approved') {
      return res.json({ success: true, message: 'Status not approved, ignored' })
    }

    if (!transaction_id) {
      return res.status(400).json({ success: false, error: 'Missing transaction_id' })
    }

    const revenueAmount = typeof revenue === 'number' ? revenue : parseFloat(revenue)
    if (isNaN(revenueAmount) || revenueAmount < 0) {
      return res.status(400).json({ success: false, error: 'Invalid revenue value' })
    }

    // Find pending completion by providerReference
    const completion = await prisma.v2TaskCompletion.findFirst({
      where: {
        providerReference: transaction_id,
        status: 'pending',
      },
      include: { task: true },
    })

    if (!completion) {
      return res.json({ success: true, message: 'Completion not found or already processed' })
    }

    // Calculate user share (60% of revenue)
    const userShare = revenueAmount * 0.6
    const coinsToAward = Math.floor(userShare * 100) // $0.01 per coin

    const idempotencyKey = `ayet_${transaction_id}`

    // Use a transaction to atomically update completion and credit ledger
    await prisma.$transaction([
      prisma.v2TaskCompletion.update({
        where: { id: completion.id },
        data: {
          status: 'approved',
          revenueEarnedUSD: revenueAmount,
          coinsAwarded: coinsToAward,
          approvedAt: new Date(),
        },
      }),
      prisma.v2LedgerEntry.create({
        data: {
          userId: completion.userId,
          type: V2LedgerEntryType.EARN,
          amountCoins: BigInt(coinsToAward),
          description: `Completed task: ${completion.task.title}`,
          idempotencyKey,
          referenceId: transaction_id,
          referenceType: 'task_completion',
        },
      }),
    ])

    res.json({ success: true, message: 'Postback processed' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    // Unique constraint violation = duplicate – safe to acknowledge
    if (message.includes('Unique constraint') || message.includes('idempotency_key')) {
      return res.json({ success: true, message: 'Duplicate postback, already processed' })
    }
    console.error('Error processing Ayet postback:', err)
    res.status(500).json({ success: false, error: 'Failed to process postback', detail: message })
  }
})

export default router
