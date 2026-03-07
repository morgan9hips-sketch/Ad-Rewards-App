import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * List all active rewards from the V2 catalog.
 */
export async function listActiveRewards() {
  return prisma.v2Reward.findMany({
    where: { isActive: true },
    orderBy: { costCoins: 'asc' },
  })
}

/**
 * Fetch a single reward by ID (active or not).
 */
export async function getRewardById(rewardId: string) {
  return prisma.v2Reward.findUnique({ where: { id: rewardId } })
}
