import { Prisma, PrismaClient } from '@prisma/client'

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
        coinsBalance: true,
        cashBalanceUsd: true,
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
        coinsBalance: { increment: BigInt(DAILY_LOGIN_BONUS_COINS) },
        totalCoinsEarned: { increment: BigInt(DAILY_LOGIN_BONUS_COINS) },
      },
      select: {
        coinsBalance: true,
        cashBalanceUsd: true,
      },
    })

    await tx.transaction.create({
      data: {
        userId,
        type: 'daily_streak',
        coinsChange: BigInt(DAILY_LOGIN_BONUS_COINS),
        cashChangeUsd: 0,
        coinsBalanceAfter: updatedUser.coinsBalance,
        cashBalanceAfterUsd: updatedUser.cashBalanceUsd,
        description: `Daily login streak reward (Day ${loginStreak})`,
        referenceType: 'daily_streak',
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
    const withBonus = await tx.userProfile.update({
      where: { userId },
      data: {
        coinsBalance: { increment: BigInt(WIN_STREAK_BONUS_COINS) },
        totalCoinsEarned: { increment: BigInt(WIN_STREAK_BONUS_COINS) },
      },
      select: {
        coinsBalance: true,
        cashBalanceUsd: true,
      },
    })

    await tx.transaction.create({
      data: {
        userId,
        type: 'task_win_streak_bonus',
        coinsChange: BigInt(WIN_STREAK_BONUS_COINS),
        cashChangeUsd: 0,
        coinsBalanceAfter: withBonus.coinsBalance,
        cashBalanceAfterUsd: withBonus.cashBalanceUsd,
        description: `Win streak bonus for ${WIN_STREAK_INTERVAL} completed tasks`,
        referenceType: sourceLabel,
      },
    })
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
      coinsBalance: true,
      cashBalanceUsd: true,
    },
  })

  const effectiveRate = Number(referrer.referralEarnRate)
  const referralShareCoins = Math.floor(baseCoinsEarned * effectiveRate)

  if (referralShareCoins <= 0) {
    return
  }

  const creditedReferrer = await tx.userProfile.update({
    where: { userId: referral.referrerId },
    data: {
      coinsBalance: { increment: BigInt(referralShareCoins) },
      totalCoinsEarned: { increment: BigInt(referralShareCoins) },
    },
    select: {
      coinsBalance: true,
      cashBalanceUsd: true,
    },
  })

  const earnerName =
    updatedUser.displayName ||
    updatedUser.email.split('@')[0] ||
    'your referral'

  await tx.transaction.create({
    data: {
      userId: referral.referrerId,
      type: 'referral_share',
      coinsChange: BigInt(referralShareCoins),
      cashChangeUsd: 0,
      coinsBalanceAfter: creditedReferrer.coinsBalance,
      cashBalanceAfterUsd: creditedReferrer.cashBalanceUsd,
      description: `Referral share from ${earnerName} at ${(effectiveRate * 100).toFixed(0)}%`,
      referenceType: sourceLabel,
    },
  })
}

export const retentionConfig = {
  dailyLoginBonusCoins: DAILY_LOGIN_BONUS_COINS,
  winStreakInterval: WIN_STREAK_INTERVAL,
  winStreakBonusCoins: WIN_STREAK_BONUS_COINS,
}
