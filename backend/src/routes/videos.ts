import { Router } from 'express'
import { AuthRequest } from '../middleware/auth'
import {
  getUserVideoCapStatus,
  canWatchRewardedVideo,
  recordRewardedVideoWatch,
  recordInterstitialWatch,
  getVideoCapDisplay,
} from '../services/videoCapService'

const router = Router()

/**
 * GET /api/videos/daily-cap
 * Get user's current video cap status
 */
router.get('/daily-cap', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const status = await getUserVideoCapStatus(userId)
    const display = getVideoCapDisplay(status)

    res.json({
      success: true,
      ...status,
      display,
    })
  } catch (error) {
    console.error('Error fetching video cap status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video cap status',
    })
  }
})

/**
 * POST /api/videos/watch-start
 * Check if user can start watching a video
 */
router.post('/watch-start', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { adType } = req.body // 'rewarded' or 'interstitial'

    if (adType === 'interstitial') {
      // Interstitials don't count toward cap, always allowed for Free tier
      return res.json({
        success: true,
        allowed: true,
        message: 'Watch this ad to unlock 2 more videos',
      })
    }

    // Check if user can watch rewarded video
    const check = await canWatchRewardedVideo(userId)

    if (!check.allowed) {
      return res.status(403).json({
        success: false,
        allowed: false,
        reason: check.reason,
        status: check.status,
      })
    }

    res.json({
      success: true,
      allowed: true,
      status: check.status,
    })
  } catch (error) {
    console.error('Error checking video watch permission:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check video watch permission',
    })
  }
})

/**
 * POST /api/videos/watch-complete
 * Record completion of video watch
 */
router.post('/watch-complete', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { adType } = req.body // 'rewarded' or 'interstitial'

    if (adType === 'interstitial') {
      await recordInterstitialWatch(userId)
      const status = await getUserVideoCapStatus(userId)
      
      return res.json({
        success: true,
        message: '2 more videos unlocked!',
        status,
      })
    }

    // Record rewarded video watch
    await recordRewardedVideoWatch(userId)
    const status = await getUserVideoCapStatus(userId)

    res.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error('Error recording video watch:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record video watch',
    })
  }
})

export default router

