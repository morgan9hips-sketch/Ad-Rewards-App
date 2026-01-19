import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get user's cash wallet
router.get('/wallet', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    let cashWallet = await prisma.cashWallet.findUnique({
      where: { userId },
    })

    // Create wallet if doesn't exist
    if (!cashWallet) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { country: true, currency: true },
      })

      cashWallet = await prisma.cashWallet.create({
        data: {
          userId,
          currency: userProfile?.currency || 'USD',
        },
      })
    }

    res.json({
      balance: cashWallet.balance,
      totalReceived: cashWallet.totalReceived,
      totalWithdrawn: cashWallet.totalWithdrawn,
      currency: cashWallet.currency,
      exchangeRate: cashWallet.exchangeRate,
    })
  } catch (error) {
    console.error('Error fetching cash wallet:', error)
    res.status(500).json({ error: 'Failed to fetch cash wallet' })
  }
})

// Get cash transaction history
router.get('/transactions', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { page = 1, limit = 20, type } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const whereClause: any = {
      userId,
      type: type
        ? { in: ['CASH_RECEIVE', 'CASH_WITHDRAW'] }
        : { in: ['CASH_RECEIVE', 'CASH_WITHDRAW'] },
    }

    if (type) {
      whereClause.type = type as string
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    })

    const total = await prisma.transaction.count({
      where: whereClause,
    })

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Error fetching cash transactions:', error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// Process withdrawal
router.post('/withdraw', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { amount, paypalEmail, currency = 'USD' } = req.body

    const amountCents = parseInt(amount)
    if (amountCents < 1000) {
      // $10 minimum
      return res
        .status(400)
        .json({ error: 'Minimum withdrawal amount is $10.00' })
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      const cashWallet = await tx.cashWallet.findUnique({
        where: { userId },
      })

      if (!cashWallet || cashWallet.balance < amountCents) {
        throw new Error('Insufficient balance')
      }

      // Update cash wallet
      const updatedWallet = await tx.cashWallet.update({
        where: { userId },
        data: {
          balance: { decrement: amountCents },
          totalWithdrawn: { increment: amountCents },
        },
      })

      // Create withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount: amountCents,
          method: 'PayPal',
          status: 'PENDING',
          paypalEmail,
        },
      })

      // Record transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: 'CASH_WITHDRAW',
          amount: amountCents.toString(),
          currency,
          description: `Withdrawal to PayPal: ${paypalEmail}`,
          referenceId: withdrawal.id,
          balanceSnapshot: {
            cashBalance: updatedWallet.balance.toString(),
          },
          metadata: { paypalEmail, withdrawalId: withdrawal.id },
        },
      })

      return { withdrawal, transaction, updatedWallet }
    })

    res.json({
      success: true,
      withdrawal: result.withdrawal,
      newBalance: result.updatedWallet.balance,
    })
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    if (error instanceof Error && error.message === 'Insufficient balance') {
      res.status(400).json({ error: 'Insufficient balance for withdrawal' })
    } else {
      res.status(500).json({ error: 'Failed to process withdrawal' })
    }
  }
})

export default router
