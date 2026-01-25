import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Tier-based video limits - All users get 20 videos per day
export const VIDEO_LIMITS = {
  Free: 20,
  Elite: 20,
  // Legacy tiers (for backward compatibility during migration)
  Bronze: 20,
  Silver: 20,
  Gold: 20,
}

// Free tier interstitial settings
const FREE_TIER_INTERSTITIAL_INTERVAL = 20 // Show interstitial after 20 rewarded videos
const FREE_TIER_INTERSTITIAL_UNLOCK = 2 // Unlock 2 more rewarded videos

/**
 * Get user's current video cap status
 */
export async function getUserVideoCapStatus(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      tier: true,
      dailyVideosWatched: true,
      forcedAdsWatched: true,
      lastVideoResetAt: true,
    },
  })

  if (!profile) {
    throw new Error('User profile not found')
  }

  // Check if daily reset is needed
  const now = new Date()
  const lastReset = new Date(profile.lastVideoResetAt)
  const needsReset = shouldResetDailyVideos(lastReset, now)

  if (needsReset) {
    await resetDailyVideos(userId)
    return {
      tier: profile.tier,
      dailyLimit: VIDEO_LIMITS[profile.tier] || VIDEO_LIMITS.Free,
      videosWatched: 0,
      forcedAdsWatched: 0,
      remaining: VIDEO_LIMITS[profile.tier] || VIDEO_LIMITS.Free,
      canWatchVideo: true,
      needsInterstitial: false,
      resetAt: now,
    }
  }

  const dailyLimit = VIDEO_LIMITS[profile.tier] || VIDEO_LIMITS.Free
  const remaining = Math.max(0, dailyLimit - profile.dailyVideosWatched)

  // Check if Free tier needs interstitial
  let needsInterstitial = false
  if (profile.tier === 'Free' && remaining > 0) {
    const videosSinceLastInterstitial = profile.dailyVideosWatched - (profile.forcedAdsWatched * FREE_TIER_INTERSTITIAL_INTERVAL)
    needsInterstitial = videosSinceLastInterstitial >= FREE_TIER_INTERSTITIAL_INTERVAL
  }

  return {
    tier: profile.tier,
    dailyLimit,
    videosWatched: profile.dailyVideosWatched,
    forcedAdsWatched: profile.forcedAdsWatched,
    remaining,
    canWatchVideo: remaining > 0 && !needsInterstitial,
    needsInterstitial,
    resetAt: getNextResetTime(lastReset),
  }
}

/**
 * Check if user can watch a rewarded video
 */
export async function canWatchRewardedVideo(userId: string): Promise<{
  allowed: boolean
  reason?: string
  status: any
}> {
  const status = await getUserVideoCapStatus(userId)

  if (status.videosWatched >= status.dailyLimit) {
    return {
      allowed: false,
      reason: 'Daily video limit reached',
      status,
    }
  }

  if (status.needsInterstitial) {
    return {
      allowed: false,
      reason: 'Must watch interstitial ad first',
      status,
    }
  }

  return {
    allowed: true,
    status,
  }
}

/**
 * Record a rewarded video watch
 */
export async function recordRewardedVideoWatch(userId: string) {
  await prisma.userProfile.update({
    where: { userId },
    data: {
      dailyVideosWatched: { increment: 1 },
    },
  })
}

/**
 * Record an interstitial watch (unlocks more videos for Free tier)
 */
export async function recordInterstitialWatch(userId: string) {
  await prisma.userProfile.update({
    where: { userId },
    data: {
      forcedAdsWatched: { increment: 1 },
    },
  })
}

/**
 * Check if daily videos should be reset
 */
function shouldResetDailyVideos(lastReset: Date, now: Date): boolean {
  // Check if it's a new day (midnight has passed)
  const lastResetDay = new Date(lastReset)
  lastResetDay.setHours(0, 0, 0, 0)
  
  const nowDay = new Date(now)
  nowDay.setHours(0, 0, 0, 0)
  
  return nowDay > lastResetDay
}

/**
 * Reset daily video count
 */
async function resetDailyVideos(userId: string) {
  await prisma.userProfile.update({
    where: { userId },
    data: {
      dailyVideosWatched: 0,
      forcedAdsWatched: 0,
      lastVideoResetAt: new Date(),
    },
  })
}

/**
 * Get next reset time (midnight in user's timezone)
 */
function getNextResetTime(lastReset: Date): Date {
  const nextReset = new Date(lastReset)
  nextReset.setDate(nextReset.getDate() + 1)
  nextReset.setHours(0, 0, 0, 0)
  return nextReset
}

/**
 * Get time until next reset
 */
export function getTimeUntilReset(resetAt: Date): string {
  const now = new Date()
  const diff = resetAt.getTime() - now.getTime()
  
  if (diff <= 0) return '0h 0m'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${hours}h ${minutes}m`
}

/**
 * Get video cap info for display
 */
export function getVideoCapDisplay(status: any): {
  currentProgress: string
  nextMilestone: string
  resetTime: string
} {
  const { videosWatched, dailyLimit, tier, needsInterstitial, resetAt } = status

  let nextMilestone = ''
  if (tier === 'Bronze' && needsInterstitial) {
    nextMilestone = 'Watch 1 ad to unlock 2 more videos'
  } else if (videosWatched < dailyLimit) {
    const remaining = dailyLimit - videosWatched
    nextMilestone = `${remaining} videos remaining today`
  } else {
    nextMilestone = 'Daily limit reached'
  }

  return {
    currentProgress: `Videos watched today: ${videosWatched}/${dailyLimit}`,
    nextMilestone,
    resetTime: `Resets in ${getTimeUntilReset(resetAt)}`,
  }
}
