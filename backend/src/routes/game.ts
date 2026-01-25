import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

const GAME_COMPLETION_COINS = 10
const RETRY_VIDEO_COINS = 10
const COOLDOWN_MINUTES = 5

/**
 * POST /api/game/start
 * Start a new game session
 */
router.post('/start', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    // Create new game session
    const session = await prisma.gameSession.create({
      data: {
        userId,
        gameType: 'bubble_shooter',
        livesUsed: 1,
      },
    })

    res.json({
      success: true,
      sessionId: session.id,
      message: 'Game session started',
    })
  } catch (error: any) {
    console.error('Error starting game:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start game',
    })
  }
})

/**
 * POST /api/game/end
 * Record game end (score and completion)
 */
router.post('/end', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId, score, completed } = req.body

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      })
    }

    // Verify session belongs to user
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Invalid session',
      })
    }

    // Update session
    const updateData: any = {
      score: score || 0,
      lastGameOverAt: new Date(),
    }

    // If completed, award coins
    if (completed) {
      updateData.completedAt = new Date()
      updateData.coinsEarned = GAME_COMPLETION_COINS

      // Award coins to user
      await prisma.userProfile.update({
        where: { userId },
        data: {
          coinsBalance: { increment: GAME_COMPLETION_COINS },
          totalCoinsEarned: { increment: GAME_COMPLETION_COINS },
        },
      })

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId,
          type: 'game_completion',
          coinsChange: GAME_COMPLETION_COINS,
          description: `Mini game completed - Score: ${score}`,
        },
      })
    }

    await prisma.gameSession.update({
      where: { id: sessionId },
      data: updateData,
    })

    res.json({
      success: true,
      coinsEarned: completed ? GAME_COMPLETION_COINS : 0,
      message: completed ? 'Game completed!' : 'Game over',
    })
  } catch (error: any) {
    console.error('Error ending game:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to end game',
    })
  }
})

/**
 * GET /api/game/can-retry/:sessionId
 * Check if user can retry (with video or after cooldown)
 */
router.get('/can-retry/:sessionId', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId } = req.params

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Invalid session',
      })
    }

    // User can always watch a video to retry
    const canRetryWithVideo = true

    // Check if cooldown has passed
    let canRetryWithWait = false
    let waitTimeRemaining = 0

    if (session.lastGameOverAt) {
      const cooldownEnd = new Date(session.lastGameOverAt)
      cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES)

      const now = new Date()
      canRetryWithWait = now >= cooldownEnd

      if (!canRetryWithWait) {
        waitTimeRemaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000)
      }
    }

    res.json({
      success: true,
      canRetryWithVideo,
      canRetryWithWait,
      waitTimeRemaining,
    })
  } catch (error: any) {
    console.error('Error checking retry:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check retry',
    })
  }
})

/**
 * POST /api/game/retry-video
 * User watches retry video to continue
 */
router.post('/retry-video', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId, admobImpressionId } = req.body

    if (!sessionId || !admobImpressionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and AdMob impression ID are required',
      })
    }

    // Verify session
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Invalid session',
      })
    }

    // Update session
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        retriesWithVideo: { increment: 1 },
        lastGameOverAt: null, // Reset cooldown
      },
    })

    // Award retry coins
    await prisma.userProfile.update({
      where: { userId },
      data: {
        coinsBalance: { increment: RETRY_VIDEO_COINS },
        totalCoinsEarned: { increment: RETRY_VIDEO_COINS },
      },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'retry_video',
        coinsChange: RETRY_VIDEO_COINS,
        description: 'Game retry video watched',
      },
    })

    res.json({
      success: true,
      coinsEarned: RETRY_VIDEO_COINS,
      message: 'Retry granted! Continue playing.',
    })
  } catch (error: any) {
    console.error('Error processing retry video:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process retry video',
    })
  }
})

/**
 * POST /api/game/retry-wait
 * User waited 5 minutes, grant free retry
 */
router.post('/retry-wait', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      })
    }

    // Verify session
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Invalid session',
      })
    }

    // Check if cooldown has passed
    if (session.lastGameOverAt) {
      const cooldownEnd = new Date(session.lastGameOverAt)
      cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES)

      if (new Date() < cooldownEnd) {
        return res.status(400).json({
          success: false,
          error: 'Cooldown not complete yet',
        })
      }
    }

    // Update session
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        retriesWithWait: { increment: 1 },
        lastGameOverAt: null, // Reset cooldown
      },
    })

    res.json({
      success: true,
      message: 'Free retry granted! Continue playing.',
    })
  } catch (error: any) {
    console.error('Error processing retry wait:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process retry wait',
    })
  }
})

/**
 * GET /api/game/stats
 * Get user's game statistics
 */
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const sessions = await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const totalGames = sessions.length
    const completedGames = sessions.filter((s) => s.completedAt).length
    const totalCoinsEarned = sessions.reduce((sum, s) => sum + s.coinsEarned, 0)
    const highScore = Math.max(...sessions.map((s) => s.score), 0)
    const totalRetries = sessions.reduce(
      (sum, s) => sum + s.retriesWithVideo + s.retriesWithWait,
      0
    )

    res.json({
      success: true,
      stats: {
        totalGames,
        completedGames,
        totalCoinsEarned,
        highScore,
        totalRetries,
      },
      recentSessions: sessions.slice(0, 10),
    })
  } catch (error: any) {
    console.error('Error getting game stats:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get game stats',
    })
  }
})

export default router
