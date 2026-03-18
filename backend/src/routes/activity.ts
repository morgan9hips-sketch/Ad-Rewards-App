import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

function anonymizeName(
  displayName?: string | null,
  email?: string | null,
): string {
  const raw = (displayName || email?.split('@')[0] || 'member').trim()
  if (raw.length <= 2) return `${raw[0] || 'M'}*`
  return `${raw[0]}${'*'.repeat(Math.max(1, raw.length - 2))}${raw[raw.length - 1]}`
}

router.get('/feed', async (req: AuthRequest, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        coinsChange: {
          gt: BigInt(0),
        },
        type: {
          in: [
            'coin_earned',
            'task_win_streak_bonus',
            'referral_share',
            'daily_streak',
          ],
        },
      },
      select: {
        id: true,
        type: true,
        coinsChange: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const earningEvents = transactions.map((entry) => ({
      id: `t-${entry.id}`,
      eventType: 'earning',
      actor: anonymizeName(entry.user.displayName, entry.user.email),
      message: entry.description || 'earned coins',
      coins: entry.coinsChange.toString(),
      createdAt: entry.createdAt,
    }))

    const feed = [...earningEvents]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)

    res.json({ success: true, feed })
  } catch (error) {
    console.error('Error fetching activity feed:', error)
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch activity feed' })
  }
})

export default router
