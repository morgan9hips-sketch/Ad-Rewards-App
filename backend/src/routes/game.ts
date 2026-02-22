import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getClientIP, detectCountryFromIP, lockRevenueCountry } from '../services/geoService.js'
import { awardCoins } from '../services/transactionService.js'

const router = Router()
const prisma = new PrismaClient()

// Legacy constants (kept for backward compatibility)
const GAME_COMPLETION_COINS = 10
const RETRY_VIDEO_COINS = 10
const COOLDOWN_MINUTES = 5

// New session-based constants
const SESSION_COOLDOWN_MINUTES = 15
const DAILY_SESSION_CAP = 20
const OPT_IN_COINS = 100
const GAME_BONUS_COINS = 10

// Revenue split ratios
const OPT_IN_USER_SHARE = 0.85
const RETRY_USER_SHARE = 0.10

// ─── NEW SESSION-BASED ENDPOINTS ─────────────────────────────────────────────

/**
 * POST /api/game/start-session
 * Create a new game session after checking daily cap and cooldown.
 */
router.post('/start-session', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    // Check daily cap: count completed sessions today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const todaySessions = await prisma.gameSession.count({
      where: {
        userId,
        status: 'completed',
        completedAt: { gte: startOfDay },
      },
    })

    if (todaySessions >= DAILY_SESSION_CAP) {
      return res.status(429).json({
        success: false,
        error: 'Daily session cap reached',
        dailyCap: DAILY_SESSION_CAP,
        sessionsToday: todaySessions,
      })
    }

    // Check 15-minute cooldown from last completed session
    const lastSession = await prisma.gameSession.findFirst({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
    })

    if (lastSession?.completedAt) {
      const cooldownEnd = new Date(lastSession.completedAt)
      cooldownEnd.setMinutes(cooldownEnd.getMinutes() + SESSION_COOLDOWN_MINUTES)

      if (new Date() < cooldownEnd) {
        const waitMs = cooldownEnd.getTime() - Date.now()
        return res.status(429).json({
          success: false,
          error: 'Cooldown active',
          cooldownEndsAt: cooldownEnd.toISOString(),
          waitSeconds: Math.ceil(waitMs / 1000),
        })
      }
    }

    // Create new session
    const session = await prisma.gameSession.create({
      data: {
        userId,
        status: 'active',
        baseCoins: 0,
        gameBonus: 0,
        totalCoins: 0,
        gamesPlayed: 0,
        gamesCompleted: 0,
        retryAdsWatched: 0,
        // Legacy fields
        gameType: 'flappy_bird',
        livesUsed: 1,
      },
    })

    res.json({
      success: true,
      sessionId: session.id,
      dailyCap: DAILY_SESSION_CAP,
      sessionsToday: todaySessions,
      remainingSessions: DAILY_SESSION_CAP - todaySessions,
    })
  } catch (error: any) {
    console.error('Error starting session:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to start session' })
  }
})

/**
 * POST /api/game/complete-ad
 * Record ad completion with revenue split calculation.
 * Body: { sessionId, adType: 'OPT_IN_REWARDED' | 'RETRY_REWARDED', estimatedRevenueUsd? }
 */
router.post('/complete-ad', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId, adType, estimatedRevenueUsd, ogadsClickId } = req.body

    if (!sessionId || !adType) {
      return res.status(400).json({ success: false, error: 'sessionId and adType are required' })
    }

    // Validate session
    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Invalid session' })
    }
    if (session.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Session is not active' })
    }

    // Geo-detection and revenue country locking
    const ip = getClientIP(req)
    const detectedCountry = detectCountryFromIP(ip) || 'US'
    const revenueCountry = await lockRevenueCountry(userId, detectedCountry)

    // Calculate revenue split
    const revenue = parseFloat(estimatedRevenueUsd || '0')
    let userShareUsd = 0
    let platformShareUsd = revenue
    let coinsEarned = 0
    let includeInPool = false

    if (adType === 'OPT_IN_REWARDED') {
      userShareUsd = revenue * OPT_IN_USER_SHARE
      platformShareUsd = revenue * (1 - OPT_IN_USER_SHARE)
      coinsEarned = OPT_IN_COINS
      includeInPool = true
    } else if (adType === 'RETRY_REWARDED') {
      userShareUsd = revenue * RETRY_USER_SHARE
      platformShareUsd = revenue * (1 - RETRY_USER_SHARE)
      coinsEarned = 0 // Only get +10 if game is completed
      includeInPool = true
    } else if (adType === 'FORCED_INTERSTITIAL') {
      userShareUsd = 0
      platformShareUsd = revenue
      coinsEarned = 0
      includeInPool = false
    }

    // Record the ad view
    const adView = await prisma.adView.create({
      data: {
        userId,
        adUnitId: `ogads-${adType.toLowerCase()}`,
        watchedSeconds: 30,
        completed: true,
        rewardCents: 0,
        coinsEarned,
        coinsAwarded: coinsEarned,
        adType: adType as any,
        adNetwork: 'ogads',
        estimatedEarningsUsd: revenue > 0 ? revenue : undefined,
        userShareUsd: userShareUsd > 0 ? userShareUsd : undefined,
        platformShareUsd: platformShareUsd > 0 ? platformShareUsd : undefined,
        userEarningsUsd: userShareUsd,
        companyRevenueUsd: platformShareUsd,
        revenueUsd: revenue,
        ogadsClickId: ogadsClickId || undefined,
        countryCode: revenueCountry,
        ipAddress: ip,
        ipCountry: detectedCountry,
        gameSessionId: sessionId,
        converted: false,
      },
    })

    // Update session based on adType
    const sessionUpdate: Record<string, any> = {}
    if (adType === 'OPT_IN_REWARDED') {
      sessionUpdate.initialAdId = adView.id
      sessionUpdate.baseCoins = OPT_IN_COINS
    } else if (adType === 'RETRY_REWARDED') {
      sessionUpdate.retryAdsWatched = { increment: 1 }
    }
    await prisma.gameSession.update({ where: { id: sessionId }, data: sessionUpdate })

    res.json({
      success: true,
      adViewId: adView.id,
      coinsEarned,
      revenueCountry,
      includeInPool,
      userShareUsd,
      platformShareUsd,
    })
  } catch (error: any) {
    console.error('Error completing ad:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to complete ad' })
  }
})

/**
 * POST /api/game/attempt
 * Record a game attempt (play, die, or complete).
 * Body: { sessionId, result: 'playing' | 'died' | 'completed', score? }
 */
router.post('/attempt', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId, result, score } = req.body

    if (!sessionId || !result) {
      return res.status(400).json({ success: false, error: 'sessionId and result are required' })
    }

    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Invalid session' })
    }

    const updateData: Record<string, any> = { lastGameAt: new Date() }

    if (result === 'playing') {
      updateData.gamesPlayed = { increment: 1 }
    } else if (result === 'died') {
      updateData.score = score || 0
      updateData.lastGameOverAt = new Date()
    } else if (result === 'completed') {
      updateData.gamesCompleted = { increment: 1 }
      updateData.gameBonus = { increment: GAME_BONUS_COINS }
      updateData.score = score || 0
      updateData.completedAt = new Date()
    }

    await prisma.gameSession.update({ where: { id: sessionId }, data: updateData })

    res.json({
      success: true,
      result,
      bonusCoins: result === 'completed' ? GAME_BONUS_COINS : 0,
    })
  } catch (error: any) {
    console.error('Error recording attempt:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to record attempt' })
  }
})

/**
 * POST /api/game/finish-session
 * Award all earned coins, mark session completed, and start 15-min cooldown.
 */
router.post('/finish-session', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' })
    }

    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Invalid session' })
    }
    if (session.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Session is already finished' })
    }

    // Calculate total coins (baseCoins from opt-in ad + gameBonus from completions)
    const totalCoins = session.baseCoins + session.gameBonus

    // Mark session as completed
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        totalCoins,
        completedAt: new Date(),
        coinsEarned: totalCoins,
      },
    })

    // Award total coins to user
    if (totalCoins > 0) {
      await awardCoins(
        userId,
        totalCoins,
        `Session reward: ${session.baseCoins} base + ${session.gameBonus} game bonus`,
        0,
        'game_session'
      )
    }

    // Update user ad watch count (daily cap tracking)
    await prisma.userProfile.update({
      where: { userId },
      data: { adsWatched: { increment: 1 } },
    })

    const cooldownEndsAt = new Date()
    cooldownEndsAt.setMinutes(cooldownEndsAt.getMinutes() + SESSION_COOLDOWN_MINUTES)

    res.json({
      success: true,
      totalCoins,
      baseCoins: session.baseCoins,
      gameBonus: session.gameBonus,
      gamesPlayed: session.gamesPlayed,
      gamesCompleted: session.gamesCompleted,
      retryAdsWatched: session.retryAdsWatched,
      cooldownEndsAt: cooldownEndsAt.toISOString(),
      message: `Session complete! You earned ${totalCoins} AdCoins.`,
    })
  } catch (error: any) {
    console.error('Error finishing session:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to finish session' })
  }
})

/**
 * GET /api/game/session/:id
 * Get session details.
 */
router.get('/session/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { id } = req.params

    const session = await prisma.gameSession.findUnique({
      where: { id },
      include: {
        adViews: {
          select: { id: true, adType: true, coinsEarned: true, createdAt: true },
        },
      },
    })

    if (!session || session.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Invalid session' })
    }

    res.json({ success: true, session })
  } catch (error: any) {
    console.error('Error getting session:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to get session' })
  }
})

/**
 * GET /api/game/status
 * Get daily cap and cooldown status for the current user.
 */
router.get('/status', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const todaySessions = await prisma.gameSession.count({
      where: { userId, status: 'completed', completedAt: { gte: startOfDay } },
    })

    const lastSession = await prisma.gameSession.findFirst({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
    })

    let cooldownActive = false
    let cooldownEndsAt: string | null = null
    let waitSeconds = 0

    if (lastSession?.completedAt) {
      const end = new Date(lastSession.completedAt)
      end.setMinutes(end.getMinutes() + SESSION_COOLDOWN_MINUTES)
      if (new Date() < end) {
        cooldownActive = true
        cooldownEndsAt = end.toISOString()
        waitSeconds = Math.ceil((end.getTime() - Date.now()) / 1000)
      }
    }

    res.json({
      success: true,
      dailyCap: DAILY_SESSION_CAP,
      sessionsToday: todaySessions,
      remainingSessions: Math.max(0, DAILY_SESSION_CAP - todaySessions),
      cooldownActive,
      cooldownEndsAt,
      waitSeconds,
    })
  } catch (error: any) {
    console.error('Error getting game status:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to get status' })
  }
})

// ─── LEGACY ENDPOINTS (kept for backward compatibility) ───────────────────────

/**
 * POST /api/game/start
 * Start a new game session (legacy)
 */
router.post('/start', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

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
    res.status(500).json({ success: false, error: error.message || 'Failed to start game' })
  }
})

/**
 * POST /api/game/end
 * Record game end (legacy)
 */
router.post('/end', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId, score, completed } = req.body

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' })
    }

    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Invalid session' })
    }

    const updateData: any = { score: score || 0, lastGameOverAt: new Date() }

    if (completed) {
      updateData.completedAt = new Date()
      updateData.coinsEarned = GAME_COMPLETION_COINS
      await prisma.userProfile.update({
        where: { userId },
        data: {
          coinsBalance: { increment: GAME_COMPLETION_COINS },
          totalCoinsEarned: { increment: GAME_COMPLETION_COINS },
        },
      })
      await prisma.transaction.create({
        data: {
          userId,
          type: 'game_completion',
          coinsChange: GAME_COMPLETION_COINS,
          description: `Session reward - Game completed (Score: ${score})`,
        },
      })
    }

    await prisma.gameSession.update({ where: { id: sessionId }, data: updateData })

    res.json({
      success: true,
      coinsEarned: completed ? GAME_COMPLETION_COINS : 0,
      message: completed ? 'Game completed!' : 'Game over',
    })
  } catch (error: any) {
    console.error('Error ending game:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to end game' })
  }
})

/**
 * GET /api/game/can-retry/:sessionId
 * Check if user can retry (legacy)
 */
router.get('/can-retry/:sessionId', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId } = req.params

    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Invalid session' })
    }

    let canRetryWithWait = false
    let waitTimeRemaining = 0

    if (session.lastGameOverAt) {
      const cooldownEnd = new Date(session.lastGameOverAt)
      cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES)
      canRetryWithWait = new Date() >= cooldownEnd
      if (!canRetryWithWait) {
        waitTimeRemaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000)
      }
    }

    res.json({ success: true, canRetryWithVideo: true, canRetryWithWait, waitTimeRemaining })
  } catch (error: any) {
    console.error('Error checking retry:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to check retry' })
  }
})

/**
 * POST /api/game/retry-video
 * User watches retry video to continue (legacy)
 */
router.post('/retry-video', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId, admobImpressionId } = req.body

    if (!sessionId || !admobImpressionId) {
      return res.status(400).json({ success: false, error: 'Session ID and impression ID are required' })
    }

    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Invalid session' })
    }

    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { retriesWithVideo: { increment: 1 }, lastGameOverAt: null },
    })
    await prisma.userProfile.update({
      where: { userId },
      data: {
        coinsBalance: { increment: RETRY_VIDEO_COINS },
        totalCoinsEarned: { increment: RETRY_VIDEO_COINS },
      },
    })
    await prisma.transaction.create({
      data: { userId, type: 'retry_video', coinsChange: RETRY_VIDEO_COINS, description: 'Retry reward - Session continuation' },
    })

    res.json({ success: true, coinsEarned: RETRY_VIDEO_COINS, message: 'Retry granted!' })
  } catch (error: any) {
    console.error('Error processing retry video:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to process retry video' })
  }
})

/**
 * POST /api/game/retry-wait
 * Free retry after cooldown (legacy)
 */
router.post('/retry-wait', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' })
    }

    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Invalid session' })
    }

    if (session.lastGameOverAt) {
      const cooldownEnd = new Date(session.lastGameOverAt)
      cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES)
      if (new Date() < cooldownEnd) {
        return res.status(400).json({ success: false, error: 'Cooldown not complete yet' })
      }
    }

    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { retriesWithWait: { increment: 1 }, lastGameOverAt: null },
    })

    res.json({ success: true, message: 'Free retry granted! Continue playing.' })
  } catch (error: any) {
    console.error('Error processing retry wait:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to process retry wait' })
  }
})

/**
 * GET /api/game/stats
 * Get user game statistics (legacy)
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
    const totalRetries = sessions.reduce((sum, s) => sum + s.retriesWithVideo + s.retriesWithWait, 0)

    res.json({
      success: true,
      stats: { totalGames, completedGames, totalCoinsEarned, highScore, totalRetries },
      recentSessions: sessions.slice(0, 10),
    })
  } catch (error: any) {
    console.error('Error getting game stats:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to get game stats' })
  }
})

export default router
