import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /api/v2/tasks
 *
 * Returns active tasks filtered by the authenticated user's country.
 * Tasks with an empty geoCountries array are available globally.
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id

  try {
    const user = await prisma.userProfile.findUnique({
      where: { userId },
      select: { countryCode: true },
    })

    const userCountry = user?.countryCode || 'US'

    const now = new Date()
    const tasks = await prisma.v2Task.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter by geo in application layer (Prisma array contains + isEmpty combo)
    const filteredTasks = tasks.filter(
      (t) => t.geoCountries.length === 0 || t.geoCountries.includes(userCountry),
    )

    res.json({ success: true, tasks: filteredTasks, userCountry })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error fetching tasks:', err)
    res.status(500).json({ success: false, error: 'Failed to fetch tasks', detail: message })
  }
})

/**
 * POST /api/v2/tasks/:id/complete
 *
 * Marks a task as completed (status=pending, awaiting provider approval).
 * Prevents duplicate completions via the unique (userId, taskId) constraint.
 */
router.post('/:id/complete', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id
  const taskId = parseInt(req.params.id, 10)

  if (isNaN(taskId)) {
    return res.status(400).json({ success: false, error: 'Invalid task id' })
  }

  const { providerReference } = req.body

  try {
    const task = await prisma.v2Task.findUnique({ where: { id: taskId } })

    if (!task || !task.isActive) {
      return res.status(404).json({ success: false, error: 'Task not found or inactive' })
    }

    // Check for expired task
    if (task.expiresAt && task.expiresAt <= new Date()) {
      return res.status(404).json({ success: false, error: 'Task has expired' })
    }

    // Check for duplicate completion
    const existing = await prisma.v2TaskCompletion.findUnique({
      where: { userId_taskId: { userId, taskId } },
    })

    if (existing) {
      return res.status(400).json({ success: false, error: 'Task already completed' })
    }

    const completion = await prisma.v2TaskCompletion.create({
      data: {
        userId,
        taskId,
        status: 'pending',
        providerReference: providerReference || null,
        coinsAwarded: 0,
      },
    })

    res.json({
      success: true,
      completion,
      message: 'Task completion submitted. Awaiting provider confirmation.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error completing task:', err)
    res.status(500).json({ success: false, error: 'Failed to complete task', detail: message })
  }
})

export default router
