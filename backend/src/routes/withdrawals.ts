import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Create withdrawal request
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { amount, method, paypalEmail } = req.body

    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // Check minimum withdrawal
    const minimumWithdrawal = 500 // $5.00
    if (amount < minimumWithdrawal) {
      return res.status(400).json({ error: 'Minimum withdrawal is $5.00' })
    }

    // Check balance
    if (profile.walletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    // Create withdrawal
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        method,
        paypalEmail,
        status: 'pending',
      },
    })

    // Deduct from wallet
    await prisma.userProfile.update({
      where: { userId },
      data: {
        walletBalance: { decrement: amount },
      },
    })

    res.json(withdrawal)
  } catch (error) {
    console.error('Error creating withdrawal:', error)
    res.status(500).json({ error: 'Failed to create withdrawal' })
  }
})

// Get user withdrawals
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    res.json(withdrawals)
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    res.status(500).json({ error: 'Failed to fetch withdrawals' })
  }
})

export default router
