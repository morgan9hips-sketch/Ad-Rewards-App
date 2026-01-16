import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getExchangeRate, convertFromUSD, getUserCurrencyInfo } from '../services/currencyService.js'
import { getUserTransactions } from '../services/transactionService.js'
import { getClientIP } from '../services/geoService.js'

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
    const { name, country, paypalEmail, preferredCurrency, autoDetectCurrency } = req.body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (country !== undefined) updateData.country = country
    if (paypalEmail !== undefined) updateData.paypalEmail = paypalEmail
    if (preferredCurrency !== undefined) updateData.preferredCurrency = preferredCurrency
    if (autoDetectCurrency !== undefined) updateData.autoDetectCurrency = autoDetectCurrency

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: updateData,
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
    const ipAddress = getClientIP(req)

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

    const cashUSD = parseFloat(profile.cashBalanceUsd.toString())
    
    // Get user's currency info
    const currencyInfo = await getUserCurrencyInfo(userId, ipAddress)
    const cashLocal = cashUSD * currencyInfo.exchangeRate
    
    // Format the local amount
    const cashLocalFormatted = `${currencyInfo.formatting.symbol}${cashLocal.toFixed(currencyInfo.formatting.decimals)}`

    res.json({
      coins: profile.coinsBalance.toString(),
      cashUsd: cashUSD.toFixed(4),
      cashLocal: cashLocal.toFixed(2),
      cashLocalFormatted,
      displayCurrency: currencyInfo.displayCurrency,
      displayCountry: currencyInfo.displayCountry,
      revenueCountry: currencyInfo.revenueCountry,
      exchangeRate: currencyInfo.exchangeRate.toFixed(6),
      currencySymbol: currencyInfo.formatting.symbol,
      currencyPosition: currencyInfo.formatting.position,
    })
  } catch (error) {
    console.error('Error fetching balance:', error)
    res.status(500).json({ error: 'Failed to fetch balance' })
  }
})

// Get user's currency info
router.get('/currency-info', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const ipAddress = getClientIP(req)

    const currencyInfo = await getUserCurrencyInfo(userId, ipAddress)

    res.json(currencyInfo)
  } catch (error) {
    console.error('Error fetching currency info:', error)
    res.status(500).json({ error: 'Failed to fetch currency info' })
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
