import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get user's coin wallet
router.get('/wallet', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    let coinWallet = await prisma.coinWallet.findUnique({
      where: { userId },
    })

    // Create wallet if doesn't exist
    if (!coinWallet) {
      coinWallet = await prisma.coinWallet.create({
        data: { userId },
      })
    }

    res.json({
      balance: coinWallet.balance.toString(),
      totalEarned: coinWallet.totalEarned.toString(),
      totalConverted: coinWallet.totalConverted.toString(),
      lastConversion: coinWallet.lastConversion,
    })
  } catch (error) {
    console.error('Error fetching coin wallet:', error)
    res.status(500).json({ error: 'Failed to fetch coin wallet' })
  }
})

// Get coin transaction history
router.get('/transactions', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { page = 1, limit = 20, type } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const whereClause: any = {
      userId,
      type: type
        ? { in: ['COIN_EARN', 'COIN_CONVERT'] }
        : { in: ['COIN_EARN', 'COIN_CONVERT'] },
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
    console.error('Error fetching coin transactions:', error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// Award coins for ad completion
router.post('/award', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { adId, adViewId, amount = '100' } = req.body

    const coinAmount = BigInt(amount)

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Get or create coin wallet
      let coinWallet = await tx.coinWallet.findUnique({
        where: { userId },
      })

      if (!coinWallet) {
        coinWallet = await tx.coinWallet.create({
          data: { userId },
        })
      }

      // Update coin wallet
      const updatedWallet = await tx.coinWallet.update({
        where: { userId },
        data: {
          balance: { increment: coinAmount },
          totalEarned: { increment: coinAmount },
        },
      })

      // Record transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: 'COIN_EARN',
          amount: coinAmount.toString(),
          description: `Earned ${amount} coins from watching ad`,
          referenceId: adViewId,
          balanceSnapshot: {
            coinBalance: updatedWallet.balance.toString(),
            cashBalance: '0', // Will get from cash wallet if exists
          },
          metadata: { adId, adViewId },
        },
      })

      return { updatedWallet, transaction }
    })

    res.json({
      success: true,
      newBalance: result.updatedWallet.balance.toString(),
      transaction: result.transaction,
    })
  } catch (error) {
    console.error('Error awarding coins:', error)
    res.status(500).json({ error: 'Failed to award coins' })
  }
})

export default router
