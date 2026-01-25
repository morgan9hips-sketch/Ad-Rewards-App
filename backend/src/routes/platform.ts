import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /api/platform/stats/24h
 * Get platform statistics for the last 24 hours
 */
router.get('/stats/24h', async (req: AuthRequest, res) => {
  try {
    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // Get user's currency preference
    const userId = req.user!.id
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferredCurrency: true },
    })

    const currency = profile?.preferredCurrency || 'USD'

    // Get withdrawals from last 24 hours
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        status: 'completed',
        completedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    })

    const totalWithdrawals = withdrawals.length
    
    // Calculate total paid out in user's currency
    let totalPaidOut = 0
    withdrawals.forEach((w) => {
      if (w.currencyCode === currency) {
        totalPaidOut += parseFloat(w.amountLocal.toString())
      } else {
        // For simplicity, use USD as fallback
        totalPaidOut += parseFloat(w.amountUsd.toString())
      }
    })

    const avgPayout = totalWithdrawals > 0 ? totalPaidOut / totalWithdrawals : 0

    res.json({
      totalWithdrawals,
      totalPaidOut: Math.round(totalPaidOut),
      currency,
      avgPayout: Math.round(avgPayout),
    })
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    res.status(500).json({ error: 'Failed to fetch platform statistics' })
  }
})

export default router
