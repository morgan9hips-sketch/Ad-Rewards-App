import { PrismaClient } from '@prisma/client'
import { getV2Balance } from './ledger.js'
import { getRewardById } from './rewards.js'

const prisma = new PrismaClient()

/**
 * Create a new claim for a reward.
 * Validates sufficient balance and debits coins atomically.
 *
 * @returns The created V2Claim record
 * @throws  Error with a human-readable message on validation failure
 */
export async function createClaim(userId: string, rewardId: string) {
  const reward = await getRewardById(rewardId)
  if (!reward) {
    throw Object.assign(new Error('Reward not found'), { status: 404 })
  }
  if (!reward.isActive) {
    throw Object.assign(new Error('Reward is no longer available'), { status: 400 })
  }

  const costCoins = BigInt(reward.costCoins)
  const balance = await getV2Balance(userId)

  if (balance < costCoins) {
    throw Object.assign(
      new Error(`Insufficient balance: need ${costCoins} coins, have ${balance}`),
      { status: 400 },
    )
  }

  // Debit and create claim in a transaction
  return prisma.$transaction(async (tx) => {
    // Create ledger debit
    await tx.v2LedgerEntry.create({
      data: {
        userId,
        amountCoins: -costCoins,
        entryType: 'REDEEM',
        note: `Claim for reward: ${reward.name}`,
      },
    })

    // Create claim record
    return tx.v2Claim.create({
      data: {
        userId,
        rewardId,
        amountCoins: costCoins,
        status: 'PENDING',
      },
      include: { reward: true },
    })
  })
}

/**
 * List all claims for a user, newest first.
 */
export async function listUserClaims(userId: string) {
  return prisma.v2Claim.findMany({
    where: { userId },
    include: { reward: true },
    orderBy: { createdAt: 'desc' },
  })
}
