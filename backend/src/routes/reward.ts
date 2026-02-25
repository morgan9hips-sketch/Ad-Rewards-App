import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { canWatchRewardedVideo, recordRewardedVideoWatch } from '../services/videoCapService.js'
import { trackMonetagImpression } from '../services/monetagService.js'

const router = Router()
const prisma = new PrismaClient()

const cooldowns = new Map<string, number>()
const REWARD_COOLDOWN_MS = 60000
const DEFAULT_MONETAG_ZONE_ID = '10646214'
const REWARD_CHANCE = 0.85

function getCooldownRemaining(userId: string, now: number) {
  const lastClaim = cooldowns.get(userId)
  if (!lastClaim) return 0
  const elapsed = now - lastClaim
  if (elapsed >= REWARD_COOLDOWN_MS) return 0
  return Math.ceil((REWARD_COOLDOWN_MS - elapsed) / 1000)
}

async function handleAdReturned(userId: string, adZoneId?: string) {
  const now = Date.now()
  const remainingSeconds = getCooldownRemaining(userId, now)
  if (remainingSeconds > 0) {
    return {
      ok: false,
      status: 429,
      body: {
        success: false,
        error: `Please wait ${remainingSeconds}s before watching another ad`,
        reason: 'cooldown',
      },
    }
  }

  const capStatus = await canWatchRewardedVideo(userId)
  if (!capStatus.allowed) {
    return {
      ok: false,
      status: 429,
      body: {
        success: false,
        error: capStatus.reason || 'Ad limit reached',
        reason: 'cap',
        status: capStatus.status,
      },
    }
  }

  const rewardGranted = Math.random() < REWARD_CHANCE
  cooldowns.set(userId, now)

  if (!rewardGranted) {
    return {
      ok: true,
      status: 200,
      body: {
        success: true,
        event: 'ad_returned',
        rewardGranted: false,
      },
    }
  }

  const zoneId = adZoneId || DEFAULT_MONETAG_ZONE_ID
  const result = await trackMonetagImpression(userId, zoneId)
  await recordRewardedVideoWatch(userId)

  return {
    ok: true,
    status: 200,
    body: {
      success: true,
      event: 'ad_returned',
      rewardGranted: true,
      coinsEarned: result.coinsAwarded,
    },
  }
}

router.post('/ad-event', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { event, adZoneId } = req.body || {}

    if (event !== 'ad_requested' && event !== 'ad_returned') {
      return res.status(400).json({
        success: false,
        error: 'Invalid event. Use ad_requested or ad_returned.',
      })
    }

    if (event === 'ad_requested') {
      return res.json({ success: true, event })
    }

    const result = await handleAdReturned(userId, adZoneId)
    return res.status(result.status).json(result.body)
  } catch (error) {
    console.error('Error handling ad event:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record ad event',
    })
  }
})

router.post('/watch-ad', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const result = await handleAdReturned(userId, DEFAULT_MONETAG_ZONE_ID)
    return res.status(result.status).json(result.body)
  } catch (error) {
    console.error('Error granting ad reward:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to grant reward',
    })
  }
})

export default router