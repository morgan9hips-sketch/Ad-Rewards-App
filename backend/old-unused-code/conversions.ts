import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get current exchange rate
router.get('/rate', async (req: AuthRequest, res) => {
  try {
    const { currency = 'USD' } = req.query

    const exchangeRate = await prisma.exchangeRate.findFirst({
      where: {
        toCurrency: currency as string,
        isActive: true,
      },
      orderBy: { effectiveFrom: 'desc' },
    })

    if (!exchangeRate) {
      return res.status(404).json({ error: 'Exchange rate not found' })
    }

    res.json({
      rate: exchangeRate.rate,
      revenueShare: exchangeRate.revenueShare,
      currency: exchangeRate.toCurrency,
      effectiveFrom: exchangeRate.effectiveFrom,
    })
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    res.status(500).json({ error: 'Failed to fetch exchange rate' })
  }
})

// Get user's pending conversion for current month
router.get('/pending', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    const pendingConversion = await prisma.coinConversion.findFirst({
      where: {
        userId,
        month: currentMonth,
        status: 'PENDING',
      },
      include: {
        details: true,
      },
    })

    res.json(pendingConversion)
  } catch (error) {
    console.error('Error fetching pending conversion:', error)
    res.status(500).json({ error: 'Failed to fetch pending conversion' })
  }
})

// Get conversion history
router.get('/history', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { page = 1, limit = 12 } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const conversions = await prisma.coinConversion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
      include: {
        details: true,
      },
    })

    const total = await prisma.coinConversion.count({
      where: { userId },
    })

    res.json({
      conversions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Error fetching conversion history:', error)
    res.status(500).json({ error: 'Failed to fetch conversion history' })
  }
})

// Preview conversion for current month
router.get('/preview', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { currency = 'USD' } = req.query

    // Get coin wallet
    const coinWallet = await prisma.coinWallet.findUnique({
      where: { userId },
    })

    if (!coinWallet || coinWallet.balance === BigInt(0)) {
      return res.json({
        coinBalance: '0',
        estimatedCash: 0,
        currency,
        canConvert: false,
      })
    }

    // Get exchange rate
    const exchangeRate = await prisma.exchangeRate.findFirst({
      where: {
        toCurrency: currency as string,
        isActive: true,
      },
      orderBy: { effectiveFrom: 'desc' },
    })

    if (!exchangeRate) {
      return res.status(404).json({ error: 'Exchange rate not found' })
    }

    // Calculate estimated cash (coins / rate * revenue share)
    const coinBalance = coinWallet.balance
    const rateDecimal = parseFloat(exchangeRate.rate.toString())
    const revenueShareDecimal = parseFloat(exchangeRate.revenueShare.toString())

    const estimatedCashCents = Math.floor(
      (Number(coinBalance) / rateDecimal) * revenueShareDecimal
    )

    res.json({
      coinBalance: coinBalance.toString(),
      estimatedCash: estimatedCashCents,
      currency: currency as string,
      rate: exchangeRate.rate,
      revenueShare: exchangeRate.revenueShare,
      canConvert: coinBalance > BigInt(0),
    })
  } catch (error) {
    console.error('Error calculating conversion preview:', error)
    res.status(500).json({ error: 'Failed to calculate preview' })
  }
})

// Admin: Process monthly conversions
router.post('/process-monthly', async (req: AuthRequest, res) => {
  try {
    const adminUserId = req.user!.id
    const { month, userIds } = req.body

    if (!month) {
      return res
        .status(400)
        .json({ error: 'Month is required (YYYY-MM format)' })
    }

    const results = await prisma.$transaction(async (tx) => {
      const processedConversions = []
      const errors = []

      // Get all users with coins if no specific userIds provided
      const targetUsers =
        userIds ||
        (await tx.coinWallet
          .findMany({
            where: { balance: { gt: 0 } },
            select: { userId: true },
          })
          .then((wallets) => wallets.map((w) => w.userId)))

      for (const userId of targetUsers) {
        try {
          const result = await processUserConversion(
            tx,
            userId,
            month,
            adminUserId
          )
          if (result) {
            processedConversions.push(result)
          }
        } catch (error) {
          errors.push({
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      // Record admin action
      await tx.adminAction.create({
        data: {
          adminUserId,
          action: 'PROCESS_CONVERSIONS',
          details: {
            month,
            processedCount: processedConversions.length,
            errorCount: errors.length,
            targetUserCount: targetUsers.length,
          },
          result: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
        },
      })

      return { processedConversions, errors }
    })

    res.json({
      success: true,
      processed: results.processedConversions.length,
      errors: results.errors.length,
      details: results,
    })
  } catch (error) {
    console.error('Error processing monthly conversions:', error)
    res.status(500).json({ error: 'Failed to process conversions' })
  }
})

async function processUserConversion(
  tx: any,
  userId: string,
  month: string,
  adminUserId: string
) {
  // Check if already processed
  const existingConversion = await tx.coinConversion.findFirst({
    where: { userId, month, status: 'COMPLETED' },
  })

  if (existingConversion) {
    return null // Already processed
  }

  const coinWallet = await tx.coinWallet.findUnique({
    where: { userId },
  })

  if (!coinWallet || coinWallet.balance === BigInt(0)) {
    return null // No coins to convert
  }

  // Get exchange rate
  const exchangeRate = await tx.exchangeRate.findFirst({
    where: { toCurrency: 'USD', isActive: true },
    orderBy: { effectiveFrom: 'desc' },
  })

  if (!exchangeRate) {
    throw new Error('No active exchange rate found')
  }

  const coinAmount = coinWallet.balance
  const rateDecimal = parseFloat(exchangeRate.rate.toString())
  const revenueShareDecimal = parseFloat(exchangeRate.revenueShare.toString())

  const cashAmountCents = Math.floor(
    (Number(coinAmount) / rateDecimal) * revenueShareDecimal
  )

  // Create conversion record
  const conversion = await tx.coinConversion.create({
    data: {
      userId,
      coinAmount,
      cashAmount: cashAmountCents,
      exchangeRate: exchangeRate.rate,
      currency: 'USD',
      month,
      status: 'COMPLETED',
      processedAt: new Date(),
    },
  })

  // Update coin wallet
  await tx.coinWallet.update({
    where: { userId },
    data: {
      balance: BigInt(0),
      totalConverted: { increment: coinAmount },
    },
  })

  // Get or create cash wallet
  let cashWallet = await tx.cashWallet.findUnique({
    where: { userId },
  })

  if (!cashWallet) {
    cashWallet = await tx.cashWallet.create({
      data: { userId },
    })
  }

  // Update cash wallet
  await tx.cashWallet.update({
    where: { userId },
    data: {
      balance: { increment: cashAmountCents },
      totalReceived: { increment: cashAmountCents },
    },
  })

  // Record transactions
  await tx.transaction.create({
    data: {
      userId,
      type: 'COIN_CONVERT',
      amount: coinAmount.toString(),
      description: `Converted ${coinAmount} coins to cash`,
      referenceId: conversion.id,
      balanceSnapshot: {
        coinBalance: '0',
        cashBalance: (cashWallet.balance + cashAmountCents).toString(),
      },
    },
  })

  await tx.transaction.create({
    data: {
      userId,
      type: 'CASH_RECEIVE',
      amount: cashAmountCents.toString(),
      currency: 'USD',
      description: `Received $${(cashAmountCents / 100).toFixed(
        2
      )} from coin conversion`,
      referenceId: conversion.id,
      balanceSnapshot: {
        coinBalance: '0',
        cashBalance: (cashWallet.balance + cashAmountCents).toString(),
      },
    },
  })

  return conversion
}

export default router
