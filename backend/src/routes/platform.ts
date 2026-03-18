import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getUserCurrencyInfo } from '../services/currencyService.js'
import { getClientIP, detectCountryFromIP } from '../services/geoService.js'

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

    // Geo-currency: same logic as /api/user/currency-info (IP-based)
    const ipAddress = getClientIP(req)
    const detectedCountry = detectCountryFromIP(ipAddress) || undefined
    const currencyInfo = req.user?.id
      ? await getUserCurrencyInfo(req.user.id, 'ip', detectedCountry)
      : { displayCurrency: 'USD', exchangeRate: 1 }

    // Get withdrawals from last 24 hours
    // @ts-ignore // Legacy - scheduled for removal post-launch
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        status: 'completed',
        completedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    })

    const totalWithdrawals = withdrawals.length

    // Sum in USD (single source of truth), then convert to viewer's geo currency
    const totalPaidOutUsd = withdrawals.reduce(
      (sum, w) => sum + parseFloat(w.amountUsd.toString()),
      0,
    )

    const totalPaidOutLocal = totalPaidOutUsd * currencyInfo.exchangeRate
    const avgPayoutLocal =
      totalWithdrawals > 0 ? totalPaidOutLocal / totalWithdrawals : 0

    res.json({
      totalWithdrawals,
      totalPaidOut: Number(totalPaidOutLocal.toFixed(2)),
      currency: currencyInfo.displayCurrency,
      avgPayout: Number(avgPayoutLocal.toFixed(2)),
    })
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    res.status(500).json({ error: 'Failed to fetch platform statistics' })
  }
})

export default router
