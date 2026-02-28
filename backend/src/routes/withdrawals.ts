import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getExchangeRate, convertFromUSD } from '../services/currencyService.js'
import { processWithdrawal } from '../services/transactionService.js'

const router = Router()
const prisma = new PrismaClient()

const MINIMUM_WITHDRAWAL_USD = parseFloat(
  process.env.MINIMUM_WITHDRAWAL_USD || '10.00',
)
const BASELINE_RATE_VALUE = 1.0 // R1 per 100 coins at 1.0x multiplier

// Create withdrawal request
router.post('/request', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { paypalEmail } = req.body

    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: userId },
      select: {
        coinsBalance: true,
        cashBalanceUsd: true,
        preferredCurrency: true,
      },
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // Check minimum coins (20,000)
    const coinsBalance = Number(profile.coinsBalance)
    const MIN_COINS = 20000

    if (coinsBalance < MIN_COINS) {
      return res.status(400).json({
        error: `Minimum withdrawal is ${MIN_COINS.toLocaleString()} coins`,
        currentBalance: coinsBalance,
      })
    }

    // Get user's cash balance in USD
    const cashBalanceUsd = parseFloat(profile.cashBalanceUsd.toString())

    // Check minimum withdrawal
    if (cashBalanceUsd < MINIMUM_WITHDRAWAL_USD) {
      return res.status(400).json({
        error: `Minimum withdrawal is $${MINIMUM_WITHDRAWAL_USD.toFixed(2)} USD`,
        currentBalance: cashBalanceUsd.toFixed(2),
      })
    }

    // Validate PayPal email
    if (!paypalEmail || !paypalEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid PayPal email is required' })
    }

    // Get user's preferred currency and exchange rate
    const currency = profile.preferredCurrency || 'USD'
    const exchangeRate = await getExchangeRate(currency)
    const amountLocal = await convertFromUSD(cashBalanceUsd, currency)

    // Calculate rate multiplier
    if (coinsBalance <= 0) {
      return res.status(400).json({
        error: 'Invalid coin balance',
      })
    }
    const valuePer100Coins = (amountLocal / coinsBalance) * 100
    const rateMultiplier = valuePer100Coins / BASELINE_RATE_VALUE

    // Create withdrawal within transaction
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Create withdrawal record with coins and rate
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          userId,
          coinsWithdrawn: coinsBalance,
          rateMultiplier: rateMultiplier,
          amountUsd: cashBalanceUsd,
          amountLocal: amountLocal,
          currencyCode: currency,
          exchangeRate: exchangeRate,
          method: 'paypal',
          paypalEmail,
          status: 'pending',
        },
      })

      // Process withdrawal (deduct from balance)
      await processWithdrawal(userId, cashBalanceUsd, newWithdrawal.id, tx)

      return newWithdrawal
    })

    res.json({
      success: true,
      withdrawalId: withdrawal.id,
      coinsWithdrawn: coinsBalance,
      amountUSD: cashBalanceUsd.toFixed(2),
      amountLocal: amountLocal.toFixed(2),
      currency,
      rateMultiplier: Number(rateMultiplier.toFixed(2)),
      status: 'pending',
      message: 'Withdrawal request submitted successfully',
    })
  } catch (error) {
    console.error('Error creating withdrawal:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create withdrawal request',
    })
  }
})

// Get user withdrawals
router.get('/history', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const perPage = parseInt(req.query.perPage as string) || 20
    const skip = (page - 1) * perPage

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { userId: userId },
        orderBy: { requestedAt: 'desc' },
        take: perPage,
        skip,
      }),
      prisma.withdrawal.count({ where: { userId: userId } }),
    ])

    res.json({
      withdrawals,
      total,
      pages: Math.ceil(total / perPage),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    res.status(500).json({ error: 'Failed to fetch withdrawal history' })
  }
})

// Get recent public withdrawals for social proof
// NOTE: This must come before /:id route to avoid route conflicts
router.get('/recent-public', async (req, res) => {
  try {
    // Get last 20 completed withdrawals from the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        status: 'completed',
        completedAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    // Get coin valuation to calculate rate multiplier (latest valuation)
    const coinValuation = await prisma.coinValuation.findFirst({
      orderBy: { calculatedAt: 'desc' },
    })

    // Anonymize and format withdrawals
    const publicWithdrawals = withdrawals.map((w) => {
      // Anonymize user ID - show only last 4 chars
      const userId = `User${w.user.id.slice(-4)}`

      // Calculate coins withdrawn (reverse engineer from amount)
      const valuePer100Coins = coinValuation
        ? parseFloat(coinValuation.valuePer100Coins.toString())
        : BASELINE_RATE_VALUE
      const rateMultiplier = valuePer100Coins / BASELINE_RATE_VALUE
      const estimatedCoins = Math.round(
        (parseFloat(w.amountLocal.toString()) / valuePer100Coins) * 100,
      )

      return {
        userId,
        coins: estimatedCoins,
        amountLocal: parseFloat(w.amountLocal.toString()),
        currencyCode: w.currencyCode,
        countryCode:
          w.currencyCode === 'ZAR'
            ? 'ZA'
            : w.currencyCode === 'USD'
              ? 'US'
              : w.currencyCode === 'GBP'
                ? 'GB'
                : w.currencyCode === 'EUR'
                  ? 'EU'
                  : 'US',
        rateMultiplier,
        completedAt:
          w.completedAt?.toISOString() || w.requestedAt.toISOString(),
      }
    })

    res.json({ withdrawals: publicWithdrawals })
  } catch (error) {
    console.error('Error fetching recent withdrawals:', error)
    res.status(500).json({ error: 'Failed to fetch recent withdrawals' })
  }
})

// Get withdrawal by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const withdrawalId = req.params.id

    const withdrawal = await prisma.withdrawal.findFirst({
      where: {
        id: withdrawalId,
        userId,
      },
    })

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' })
    }

    res.json(withdrawal)
  } catch (error) {
    console.error('Error fetching withdrawal:', error)
    res.status(500).json({ error: 'Failed to fetch withdrawal' })
  }
})

export default router
