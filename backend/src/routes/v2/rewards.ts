import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /api/v2/rewards
 *
 * Returns active V2 reward catalog items (isActive=true).
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rewards = await prisma.v2Reward.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ ok: true, rewards })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: 'Failed to fetch rewards', detail: message })
  }
})

export default router
