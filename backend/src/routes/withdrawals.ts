import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { getExchangeRate, convertFromUSD } from '../services/currencyService'
import { processWithdrawal } from '../services/transactionService'

const router = Router()
const prisma = new PrismaClient()

const MINIMUM_WITHDRAWAL_USD = parseFloat(process.env.MINIMUM_WITHDRAWAL_USD || '10.00')

// Create withdrawal request
router.post('/request', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { paypalEmail } = req.body

    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
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

    // Create withdrawal within transaction
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Create withdrawal record
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          userId,
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
      amountUSD: cashBalanceUsd.toFixed(2),
      amountLocal: amountLocal.toFixed(2),
      currency,
      status: 'pending',
      message: 'Withdrawal request submitted successfully',
    })
  } catch (error) {
    console.error('Error creating withdrawal:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to create withdrawal request' 
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
        where: { userId },
        orderBy: { requestedAt: 'desc' },
        take: perPage,
        skip,
      }),
      prisma.withdrawal.count({ where: { userId } }),
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

