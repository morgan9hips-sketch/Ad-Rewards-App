import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Get all badges
router.get('/', async (req, res) => {
  try {
    const badges = await prisma.badge.findMany()
    res.json(badges)
  } catch (error) {
    console.error('Error fetching badges:', error)
    res.status(500).json({ error: 'Failed to fetch badges' })
  }
})

// Get user badges
router.get('/user', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    })

    res.json(userBadges)
  } catch (error) {
    console.error('Error fetching user badges:', error)
    res.status(500).json({ error: 'Failed to fetch user badges' })
  }
})

export default router

