import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { createPayout, getPayoutStatus } from '../services/paypalService.js'
import { getUserCurrencyInfo, convertFromUSD, CURRENCY_FORMATS } from '../services/currencyService.js'
import { getClientIP } from '../services/geoService.js'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /api/payouts/minimum
 * Get minimum withdrawal amount in user's currency
 */
router.get('/minimum', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const ipAddress = getClientIP(req)
    
    const currencyInfo = await getUserCurrencyInfo(userId, ipAddress)
    const minWithdrawalUsd = parseFloat(process.env.MINIMUM_WITHDRAWAL_USD || '10')
    
    const minWithdrawalLocal = await convertFromUSD(
      minWithdrawalUsd,
      currencyInfo.displayCurrency
    )

    const currencyFormat = CURRENCY_FORMATS[currencyInfo.displayCurrency]

    res.json({
      success: true,
      minWithdrawalUsd,
      minWithdrawalLocal,
      currency: currencyInfo.displayCurrency,
      symbol: currencyFormat?.symbol || '$',
    })
  } catch (error) {
    console.error('Error fetching minimum withdrawal:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch minimum withdrawal',
    })
  }
})

/**
 * POST /api/payouts/request
 * Request a payout
 */
router.post('/request', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const ipAddress = getClientIP(req)

    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        cashBalanceUsd: true,
        paypalEmail: true,
        preferredCurrency: true,
      },
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
      })
    }

    // Check if PayPal email is set
    if (!profile.paypalEmail) {
      return res.status(400).json({
        success: false,
        error: 'PayPal email not set. Please update your profile.',
      })
    }

    // Get currency info
    const currencyInfo = await getUserCurrencyInfo(userId, ipAddress)
    const minWithdrawalUsd = parseFloat(process.env.MINIMUM_WITHDRAWAL_USD || '10')
    
    // Check minimum balance
    const balanceUsd = parseFloat(profile.cashBalanceUsd.toString())
    if (balanceUsd < minWithdrawalUsd) {
      const minLocal = await convertFromUSD(minWithdrawalUsd, currencyInfo.displayCurrency)
      return res.status(400).json({
        success: false,
        error: `Minimum withdrawal is ${currencyInfo.formatting.symbol}${minLocal.toFixed(2)}`,
      })
    }

    // Convert to local currency for payout
    const payoutAmountLocal = await convertFromUSD(balanceUsd, currencyInfo.displayCurrency)
    const exchangeRate = currencyInfo.exchangeRate

    // Create payout via PayPal
    const { batchId, status } = await createPayout(
      profile.paypalEmail,
      payoutAmountLocal.toFixed(2),
      currencyInfo.displayCurrency,
      `Adify earnings withdrawal`
    )

    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amountUsd: balanceUsd,
        amountLocal: payoutAmountLocal,
        currencyCode: currencyInfo.displayCurrency,
        exchangeRate,
        method: 'PayPal',
        status: 'pending',
        paypalEmail: profile.paypalEmail,
        paypalTransactionId: batchId,
      },
    })

    // Deduct from user balance
    await prisma.userProfile.update({
      where: { userId },
      data: {
        cashBalanceUsd: 0,
        totalWithdrawnUsd: { increment: balanceUsd },
      },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'withdrawal',
        cashChangeUsd: -balanceUsd,
        cashBalanceAfterUsd: 0,
        description: `Withdrawal via PayPal to ${profile.paypalEmail}`,
        referenceId: parseInt(withdrawal.id.substring(0, 8), 16), // Convert UUID to int for legacy field
        referenceType: 'withdrawal',
      },
    })

    res.json({
      success: true,
      withdrawalId: withdrawal.id,
      batchId,
      status,
      amountUsd: balanceUsd,
      amountLocal: payoutAmountLocal,
      currency: currencyInfo.displayCurrency,
      message: 'Payout request submitted successfully',
    })
  } catch (error: any) {
    console.error('Error requesting payout:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to request payout',
    })
  }
})

/**
 * GET /api/payouts/history
 * Get payout history
 */
router.get('/history', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const perPage = parseInt(req.query.perPage as string) || 20

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { requestedAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.withdrawal.count({
        where: { userId },
      }),
    ])

    res.json({
      success: true,
      withdrawals,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error('Error fetching payout history:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payout history',
    })
  }
})

/**
 * GET /api/payouts/:id/status
 * Get payout status from PayPal
 */
router.get('/:id/status', async (req: AuthRequest, res) => {
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
      return res.status(404).json({
        success: false,
        error: 'Withdrawal not found',
      })
    }

    // Get status from PayPal
    let paypalStatus = null
    if (withdrawal.paypalTransactionId) {
      try {
        paypalStatus = await getPayoutStatus(withdrawal.paypalTransactionId)
      } catch (error) {
        console.error('Error fetching PayPal status:', error)
      }
    }

    res.json({
      success: true,
      withdrawal,
      paypalStatus,
    })
  } catch (error) {
    console.error('Error fetching payout status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payout status',
    })
  }
})

export default router
