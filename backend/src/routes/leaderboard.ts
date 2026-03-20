import { Router } from 'express'
import { PrismaClient, V2LedgerEntryType } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getCanonicalUserContext } from '../services/userContextService.js'

const router = Router()
const prisma = new PrismaClient()

type LeaderboardAggregateRow = {
  userId: string
  displayName: string | null
  email: string
  avatarEmoji: string | null
  countryBadge: string | null
  hideCountry: boolean
  coins: bigint
}

const MONTHLY_PRIZES = [
  { rank: 1, coins: 5000 },
  { rank: 2, coins: 3000 },
  { rank: 3, coins: 1500 },
]

function getMonthBounds(month?: string): {
  monthKey: string
  startOfMonth: Date
  endOfMonth: Date
} {
  const now = new Date()
  const targetDate = month ? new Date(`${month}-01T00:00:00.000Z`) : now

  const startOfMonth = new Date(
    Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), 1),
  )
  const endOfMonth = new Date(
    Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth() + 1, 1),
  )

  const monthKey = `${startOfMonth.getUTCFullYear()}-${String(startOfMonth.getUTCMonth() + 1).padStart(2, '0')}`

  return { monthKey, startOfMonth, endOfMonth }
}

async function getMonthlyLeaderboard(month?: string) {
  const { monthKey, startOfMonth, endOfMonth } = getMonthBounds(month)

  const rows = await prisma.$queryRaw<LeaderboardAggregateRow[]>`
    SELECT
      up.user_id AS "userId",
      up.display_name AS "displayName",
      up.email,
      up.avatar_emoji AS "avatarEmoji",
      up.country_badge AS "countryBadge",
      up.hide_country AS "hideCountry",
      COALESCE(SUM(CASE WHEN le.amount_coins > 0 THEN le.amount_coins ELSE 0 END), 0) AS coins
    FROM user_profiles up
    LEFT JOIN v2_ledger_entries le
      ON le.user_id = up.user_id
      AND le.created_at >= ${startOfMonth}
      AND le.created_at < ${endOfMonth}
    WHERE up.show_on_leaderboard = true
    GROUP BY up.user_id, up.display_name, up.email, up.avatar_emoji, up.country_badge, up.hide_country
    ORDER BY coins DESC
    LIMIT 100
  `

  const leaderboard = rows
    .filter((entry) => entry.coins > 0n)
    .map((entry, index) => {
      const displayName =
        entry.displayName || entry.email.split('@')[0] || 'Member'
      return {
        rank: index + 1,
        userId: entry.userId,
        displayName,
        avatarEmoji: entry.avatarEmoji || '👤',
        countryBadge: entry.hideCountry ? '🌍' : entry.countryBadge || null,
        coins: entry.coins.toString(),
      }
    })

  return {
    monthKey,
    startOfMonth,
    endOfMonth,
    leaderboard,
  }
}

// Get leaderboard
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { countryCode } = await getCanonicalUserContext(userId)

    const leaderboard = await prisma.$queryRaw<LeaderboardAggregateRow[]>`
      SELECT
        up.user_id AS "userId",
        up.display_name AS "displayName",
        up.email,
        up.avatar_emoji AS "avatarEmoji",
        up.country_badge AS "countryBadge",
        up.hide_country AS "hideCountry",
        COALESCE(SUM(CASE WHEN le.amount_coins > 0 THEN le.amount_coins ELSE 0 END), 0) AS coins
      FROM user_profiles up
      LEFT JOIN v2_ledger_entries le
        ON le.user_id = up.user_id
      WHERE up.show_on_leaderboard = true
        AND COALESCE(up.revenue_country, up.country_code, up.display_country, up.last_detected_country, 'US') = ${countryCode}
      GROUP BY up.user_id, up.display_name, up.email, up.avatar_emoji, up.country_badge, up.hide_country
      ORDER BY coins DESC
      LIMIT 100
    `

    const formattedLeaderboard = leaderboard
      .filter((profile) => profile.coins > 0n)
      .map((profile, index) => ({
        rank: index + 1,
        userId: profile.userId,
        displayName: profile.displayName || profile.email.split('@')[0],
        avatarEmoji: profile.avatarEmoji || '👤',
        countryBadge: profile.hideCountry ? '🌍' : profile.countryBadge || null,
        coins: profile.coins.toString(),
      }))

    // Get current user's rank if authenticated
    let currentUserRank = null
    const currentIndex = formattedLeaderboard.findIndex(
      (entry) => entry.userId === userId,
    )
    if (currentIndex >= 0) {
      currentUserRank = {
        rank: currentIndex + 1,
        coins: formattedLeaderboard[currentIndex].coins,
      }
    }

    res.json({
      leaderboard: formattedLeaderboard,
      currentUser: currentUserRank,
      region: countryCode,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// Get monthly leaderboard and prize metadata
router.get('/monthly', async (req: AuthRequest, res) => {
  try {
    const month =
      typeof req.query.month === 'string' ? req.query.month : undefined
    const currentUserId =
      typeof req.query.userId === 'string' ? req.query.userId : req.user?.id

    const { monthKey, endOfMonth, leaderboard } =
      await getMonthlyLeaderboard(month)

    const currentUser = currentUserId
      ? leaderboard.find((entry) => entry.userId === currentUserId) || null
      : null

    const msUntilMonthEnd = Math.max(0, endOfMonth.getTime() - Date.now())

    res.json({
      success: true,
      month: monthKey,
      leaderboard,
      prizes: MONTHLY_PRIZES,
      countdownMs: msUntilMonthEnd,
      currentUser,
    })
  } catch (error) {
    console.error('Error fetching monthly leaderboard:', error)
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch monthly leaderboard' })
  }
})

// Distribute monthly leaderboard prizes (trigger via cron/webhook)
router.post('/monthly/distribute', async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET
    const providedSecret = req.headers['x-cron-secret']

    if (cronSecret && providedSecret !== cronSecret) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const month =
      typeof req.body?.month === 'string' ? req.body.month : undefined
    const { monthKey, leaderboard } = await getMonthlyLeaderboard(month)

    const winners = MONTHLY_PRIZES.map((prize) => {
      const user = leaderboard.find((entry) => entry.rank === prize.rank)
      if (!user) return null

      return {
        rank: prize.rank,
        coins: prize.coins,
        user,
      }
    }).filter(Boolean) as Array<{
      rank: number
      coins: number
      user: {
        userId: string
        displayName: string
      }
    }>

    const distributed: Array<{
      rank: number
      userId: string
      coins: number
      created: boolean
    }> = []

    for (const winner of winners) {
      const created = await prisma.$transaction(async (tx) => {
        const existing = await tx.monthlyLeaderboardAward.findUnique({
          where: {
            month_userId: {
              month: monthKey,
              userId: winner.user.userId,
            },
          },
        })

        if (existing) {
          return false
        }

        await tx.v2LedgerEntry.create({
          data: {
            userId: winner.user.userId,
            type: V2LedgerEntryType.EARN,
            amountCoins: BigInt(winner.coins),
            idempotencyKey: `monthly_leaderboard:${monthKey}:${winner.user.userId}`,
            referenceId: winner.rank.toString(),
            referenceType: 'monthly_leaderboard',
            description: `Monthly leaderboard prize - Rank #${winner.rank} (${monthKey})`,
          },
        })

        await tx.monthlyLeaderboardAward.create({
          data: {
            month: monthKey,
            userId: winner.user.userId,
            rank: winner.rank,
            coinsAwarded: winner.coins,
          },
        })

        return true
      })

      distributed.push({
        rank: winner.rank,
        userId: winner.user.userId,
        coins: winner.coins,
        created,
      })
    }

    res.json({
      success: true,
      month: monthKey,
      distributed,
    })
  } catch (error) {
    console.error('Error distributing monthly prizes:', error)
    res
      .status(500)
      .json({ success: false, error: 'Failed to distribute monthly prizes' })
  }
})

export default router
