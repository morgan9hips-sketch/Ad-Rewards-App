import { PrismaClient } from '@prisma/client'
import { detectCountryFromIP } from './geoService.js'

const prisma = new PrismaClient()

// Rate limiting constants
const MAX_ADS_PER_DAY = parseInt(process.env.MAX_ADS_PER_DAY || '200')
const MAX_ADS_PER_5_MINUTES = parseInt(process.env.MAX_ADS_PER_5_MINUTES || '10')
const VPN_SUSPICION_THRESHOLD = parseInt(process.env.VPN_SUSPICION_THRESHOLD || '10')

/**
 * Check if user has exceeded daily ad limit
 */
export async function checkDailyAdLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const todayViews = await prisma.adView.count({
    where: {
      userId,
      createdAt: { gte: startOfDay }
    }
  })

  const remaining = Math.max(0, MAX_ADS_PER_DAY - todayViews)
  
  return {
    allowed: todayViews < MAX_ADS_PER_DAY,
    remaining
  }
}

/**
 * Check if user is watching ads too quickly (possible bot)
 */
export async function checkRapidAdViewing(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const fiveMinutesAgo = new Date()
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5)

  const recentViews = await prisma.adView.count({
    where: {
      userId,
      createdAt: { gte: fiveMinutesAgo }
    }
  })

  if (recentViews >= MAX_ADS_PER_5_MINUTES) {
    return {
      allowed: false,
      reason: `Too many ads watched in 5 minutes (${recentViews}/${MAX_ADS_PER_5_MINUTES})`
    }
  }

  return { allowed: true }
}

/**
 * Check if impression ID has already been used (duplicate claim prevention)
 */
export async function checkDuplicateImpression(impressionId: string): Promise<{ duplicate: boolean }> {
  if (!impressionId) {
    return { duplicate: false }
  }

  const existing = await prisma.adView.findUnique({
    where: { admobImpressionId: impressionId }
  })

  return { duplicate: !!existing }
}

/**
 * Detect VPN usage by comparing IP location vs AdMob location
 * Returns true if mismatch detected (possible VPN)
 */
export async function detectVPNMismatch(
  userId: string,
  ipAddress: string,
  admobCountryCode: string
): Promise<{ vpnSuspected: boolean; ipCountry: string | null; admobCountry: string }> {
  const ipCountry = detectCountryFromIP(ipAddress)
  
  // If we can't detect IP country, we can't determine mismatch
  if (!ipCountry) {
    return {
      vpnSuspected: false,
      ipCountry: null,
      admobCountry: admobCountryCode
    }
  }

  const vpnSuspected = ipCountry !== admobCountryCode

  if (vpnSuspected) {
    // Log the mismatch
    console.log(`🚨 VPN mismatch detected for user ${userId}: IP=${ipCountry}, AdMob=${admobCountryCode}`)

    // Increment user's VPN suspicion score
    await prisma.userProfile.update({
      where: { userId },
      data: {
        vpnSuspicionScore: { increment: 1 }
      }
    })

    // Check if suspicion score exceeds threshold
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { vpnSuspicionScore: true }
    })

    if (profile && profile.vpnSuspicionScore >= VPN_SUSPICION_THRESHOLD) {
      // Flag as suspicious
      await prisma.userProfile.update({
        where: { userId },
        data: { suspiciousActivity: true }
      })
    }
  }

  return {
    vpnSuspected,
    ipCountry,
    admobCountry: admobCountryCode
  }
}

/**
 * Track user's earning countries (for detecting multi-location abuse)
 */
export async function trackUserRevenueCountry(userId: string, countryCode: string): Promise<void> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      revenueCountry: true,
      revenueCountries: true
    }
  })

  if (!profile) return

  // Set primary revenue country if not set
  const updates: any = {}
  
  if (!profile.revenueCountry) {
    updates.revenueCountry = countryCode
  }

  // Add to revenue countries array if not already present
  if (!profile.revenueCountries.includes(countryCode)) {
    updates.revenueCountries = {
      push: countryCode
    }
  }

  // If user has earned from more than 5 different countries, flag as suspicious
  if (profile.revenueCountries.length >= 5 && !profile.revenueCountries.includes(countryCode)) {
    console.log(`🚨 User ${userId} has earned from ${profile.revenueCountries.length + 1} countries`)
    updates.suspiciousActivity = true
  }

  if (Object.keys(updates).length > 0) {
    await prisma.userProfile.update({
      where: { userId },
      data: updates
    })
  }
}

/**
 * Update user's last known location for fraud tracking
 */
export async function updateUserLocation(userId: string, ipAddress: string): Promise<void> {
  const ipCountry = detectCountryFromIP(ipAddress)

  await prisma.userProfile.update({
    where: { userId },
    data: {
      lastIpAddress: ipAddress,
      lastDetectedCountry: ipCountry || undefined
    }
  })
}

/**
 * Get fraud statistics for admin dashboard
 */
export async function getFraudStats(): Promise<{
  totalSuspiciousUsers: number
  highVpnSuspicionUsers: number
  multiCountryUsers: number
}> {
  const [suspicious, highVpn] = await Promise.all([
    prisma.userProfile.count({
      where: { suspiciousActivity: true }
    }),
    prisma.userProfile.count({
      where: { vpnSuspicionScore: { gte: VPN_SUSPICION_THRESHOLD } }
    })
  ])

  // Count users with multiple countries (3 or more)
  const allUsers = await prisma.userProfile.findMany({
    where: {
      revenueCountries: {
        isEmpty: false
      }
    },
    select: {
      revenueCountries: true
    }
  })

  const multiCountry = allUsers.filter(u => u.revenueCountries.length >= 3).length

  return {
    totalSuspiciousUsers: suspicious,
    highVpnSuspicionUsers: highVpn,
    multiCountryUsers: multiCountry
  }
}

/**
 * Get suspicious users list for admin review
 */
export async function getSuspiciousUsers(page: number = 1, perPage: number = 50) {
  const skip = (page - 1) * perPage

  // Find users with multiple countries or high suspicion
  const allUsers = await prisma.userProfile.findMany({
    where: {
      OR: [
        { suspiciousActivity: true },
        { vpnSuspicionScore: { gte: 5 } }
      ]
    },
    select: {
      userId: true,
      email: true,
      name: true,
      revenueCountry: true,
      revenueCountries: true,
      vpnSuspicionScore: true,
      suspiciousActivity: true,
      lastIpAddress: true,
      lastDetectedCountry: true,
      adsWatched: true,
      createdAt: true
    },
    orderBy: [
      { suspiciousActivity: 'desc' },
      { vpnSuspicionScore: 'desc' }
    ]
  })

  // Filter for users with 3+ countries or already flagged
  const filtered = allUsers.filter(u => 
    u.suspiciousActivity || 
    u.vpnSuspicionScore >= 5 || 
    u.revenueCountries.length >= 3
  )

  const total = filtered.length
  const users = filtered.slice(skip, skip + perPage)

  return {
    users,
    total,
    pages: Math.ceil(total / perPage),
    currentPage: page
  }
}

/**
 * Get VPN detection records for a user
 */
export async function getVPNDetections(userId: string) {
  // Get ad views where IP country differs from AdMob country
  const adViews = await prisma.adView.findMany({
    where: {
      userId,
      ipCountry: { not: null },
      countryCode: { not: null }
    },
    select: {
      id: true,
      ipCountry: true,
      countryCode: true,
      ipAddress: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  // Filter to mismatches
  const mismatches = adViews.filter(view => view.ipCountry !== view.countryCode)

  // Group by country pair
  const groupedMismatches = mismatches.reduce((acc: any, view) => {
    const key = `${view.ipCountry}-${view.countryCode}`
    if (!acc[key]) {
      acc[key] = {
        ipCountry: view.ipCountry,
        admobCountry: view.countryCode,
        count: 0,
        lastDetected: view.createdAt
      }
    }
    acc[key].count++
    if (view.createdAt > acc[key].lastDetected) {
      acc[key].lastDetected = view.createdAt
    }
    return acc
  }, {})

  return Object.values(groupedMismatches)
}
