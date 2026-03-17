import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.get('/featured', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const user = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        countryCode: true,
        country: true,
        taskWinStreak: true,
      },
    })

    const userCountry = user?.countryCode || user?.country || 'US'
    const now = new Date()

    const candidates = await prisma.v2Task.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ rewardCoins: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    })

    const featuredTasks = candidates
      .filter(
        (task) =>
          task.geoCountries.length === 0 ||
          task.geoCountries.includes(userCountry),
      )
      .slice(0, 3)

    res.json({
      success: true,
      userCountry,
      taskWinStreak: user?.taskWinStreak || 0,
      tasks: featuredTasks,
    })
  } catch (error) {
    console.error('Error fetching featured tasks:', error)
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch featured tasks' })
  }
})

export default router
