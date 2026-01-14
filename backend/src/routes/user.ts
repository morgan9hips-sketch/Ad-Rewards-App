import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getExchangeRate, convertFromUSD } from '../services/currencyService.js'
import { getUserTransactions } from '../services/transactionService.js'

const router = Router()
const prisma = new PrismaClient()

// Get user profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          email: req.user!.email,
        },
      })
    }

    res.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update user profile
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { name, country, paypalEmail } = req.body

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        name,
        country,
        paypalEmail,
      },
    })

    res.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Get user balance in local currency
router.get('/balance', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        coinsBalance: true,
        cashBalanceUsd: true,
        preferredCurrency: true,
      },
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    const currency = profile.preferredCurrency || 'USD'
    const cashUSD = parseFloat(profile.cashBalanceUsd.toString())
    
    // Convert to local currency
    const exchangeRate = await getExchangeRate(currency)
    const cashLocal = await convertFromUSD(cashUSD, currency)

    res.json({
      coins: profile.coinsBalance.toString(),
      cashUSD: cashUSD.toFixed(4),
      cashLocal: cashLocal.toFixed(2),
      currency,
      exchangeRate: exchangeRate.toFixed(6),
    })
  } catch (error) {
    console.error('Error fetching balance:', error)
    res.status(500).json({ error: 'Failed to fetch balance' })
  }
})

// Get user transaction history
router.get('/transactions', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const perPage = parseInt(req.query.perPage as string) || 20
    const type = req.query.type as string | undefined

    const result = await getUserTransactions(userId, page, perPage, type)

    res.json(result)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

export default router
