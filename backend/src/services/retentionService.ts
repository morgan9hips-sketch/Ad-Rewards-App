import { Prisma, PrismaClient, V2LedgerEntryType } from '@prisma/client'

const prisma = new PrismaClient()

const DAILY_LOGIN_BONUS_COINS = 20
const WIN_STREAK_INTERVAL = 5
const WIN_STREAK_BONUS_COINS = 50

function getStartOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
}

function getReferralRateByActiveCount(activeReferrals: number): number {
  if (activeReferrals >= 10) return 0.15
  if (activeReferrals >= 3) return 0.12
  return 0.1
}

export async function applyDailyLoginStreak(userId: string): Promise<void> {
  const now = new Date()
  const today = getStartOfUtcDay(now)
  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)

  await prisma.$transaction(async (tx) => {
    const profile = await tx.userProfile.findUnique({
      where: { userId },
      select: {
        loginStreak: true,
        lastLoginDate: true,
      },
    })

    if (!profile) return

    const previousLoginDate = profile.lastLoginDate
      ? getStartOfUtcDay(new Date(profile.lastLoginDate))
      : null

    if (previousLoginDate && previousLoginDate.getTime() === today.getTime()) {
      await tx.userProfile.update({
        where: { userId },
        data: {
          lastLogin: now,
          lastLoginAt: now,
        },
      })
      return
    }

    const loginStreak =
      previousLoginDate && previousLoginDate.getTime() === yesterday.getTime()
        ? profile.loginStreak + 1
        : 1

    const updatedUser = await tx.userProfile.update({
      where: { userId },
      data: {
        loginStreak,
        lastLoginDate: today,
        lastLogin: now,
        lastLoginAt: now,
      },
    })

    await tx.v2LedgerEntry.create({
      data: {
        userId,
        type: V2LedgerEntryType.EARN,
        amountCoins: BigInt(DAILY_LOGIN_BONUS_COINS),
        idempotencyKey: `daily_streak:${userId}:${today.toISOString().slice(0, 10)}`,
        referenceType: 'daily_streak',
        description: `Daily login streak reward (Day ${loginStreak})`,
        metadata: {
          loginStreak,
          source: 'retention',
        },
      },
    })
  })
}

export async function applyTaskWinStreakAndReferralShare(
  tx: Prisma.TransactionClient,
  userId: string,
  baseCoinsEarned: number,
  sourceLabel: string,
): Promise<void> {
  if (!Number.isFinite(baseCoinsEarned) || baseCoinsEarned <= 0) {
    return
  }

  const updatedUser = await tx.userProfile.update({
    where: { userId },
    data: {
      taskWinStreak: { increment: 1 },
    },
    select: {
      taskWinStreak: true,
      displayName: true,
      email: true,
    },
  })

  const shouldApplyWinBonus =
    updatedUser.taskWinStreak % WIN_STREAK_INTERVAL === 0

  if (shouldApplyWinBonus) {
    const winBonusIdempotencyKey = `win_streak:${userId}:${updatedUser.taskWinStreak}`
    const existingWinBonus = await tx.v2LedgerEntry.findUnique({
      where: { idempotencyKey: winBonusIdempotencyKey },
    })

    if (!existingWinBonus) {
      await tx.v2LedgerEntry.create({
        data: {
          userId,
          type: V2LedgerEntryType.EARN,
          amountCoins: BigInt(WIN_STREAK_BONUS_COINS),
          idempotencyKey: winBonusIdempotencyKey,
          referenceType: sourceLabel,
          description: `Win streak bonus for ${WIN_STREAK_INTERVAL} completed tasks`,
          metadata: {
            taskWinStreak: updatedUser.taskWinStreak,
            source: 'retention',
          },
        },
      })
    }
  }

  const referral = await tx.referral.findFirst({
    where: {
      refereeId: userId,
    },
    select: {
      referrerId: true,
    },
  })

  if (!referral) {
    return
  }

  await tx.referral.updateMany({
    where: {
      refereeId: userId,
      status: 'pending',
    },
    data: {
      status: 'active',
      qualifiedAt: new Date(),
    },
  })

  const activeReferralCount = await tx.referral.count({
    where: {
      referrerId: referral.referrerId,
      status: {
        in: ['active', 'qualified', 'paid'],
      },
    },
  })

  const milestoneRate = getReferralRateByActiveCount(activeReferralCount)

  const referrer = await tx.userProfile.update({
    where: { userId: referral.referrerId },
    data: {
      referralEarnRate: milestoneRate,
    },
    select: {
      referralEarnRate: true,
    },
  })

  const effectiveRate = Number(referrer.referralEarnRate)
  const referralShareCoins = Math.floor(baseCoinsEarned * effectiveRate)

  if (referralShareCoins <= 0) {
    return
  }

  const earnerName =
    updatedUser.displayName ||
    updatedUser.email.split('@')[0] ||
    'your referral'

  const referralIdempotencyKey = `referral_share:${referral.referrerId}:${userId}:${sourceLabel}:${updatedUser.taskWinStreak}`
  const existingReferralShare = await tx.v2LedgerEntry.findUnique({
    where: { idempotencyKey: referralIdempotencyKey },
  })

  if (!existingReferralShare) {
    await tx.v2LedgerEntry.create({
      data: {
        userId,
        type: V2LedgerEntryType.EARN,
        amountCoins: BigInt(referralShareCoins),
        idempotencyKey: referralIdempotencyKey,
        referenceId: userId,
        referenceType: sourceLabel,
        description: `Referral share from ${earnerName} at ${(effectiveRate * 100).toFixed(0)}%`,
        metadata: {
          baseCoinsEarned,
          effectiveRate,
          referralShareCoins,
          source: 'retention',
        },
      },
    })
  }
}

export const retentionConfig = {
  dailyLoginBonusCoins: DAILY_LOGIN_BONUS_COINS,
  winStreakInterval: WIN_STREAK_INTERVAL,
  winStreakBonusCoins: WIN_STREAK_BONUS_COINS,
}
