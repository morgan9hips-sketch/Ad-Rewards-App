import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export type TransactionType = 
  | 'coin_earned'
  | 'coin_conversion'
  | 'withdrawal'
  | 'admin_adjustment'
  | 'badge_reward'

interface CreateTransactionParams {
  userId: string
  type: TransactionType
  coinsChange?: bigint
  cashChangeUsd?: number
  description?: string
  referenceId?: number
  referenceType?: string
}

/**
 * Create a transaction record with current balance snapshot
 * This should be called within a database transaction
 */
export async function createTransaction(
  params: CreateTransactionParams,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx || prisma

  try {
    // Get current user balances
    const user = await client.userProfile.findUnique({
      where: { userId: params.userId },
      select: { 
        coinsBalance: true, 
        cashBalanceUsd: true 
      },
    })

    if (!user) {
      throw new Error(`User ${params.userId} not found`)
    }

    // Create transaction record
    await client.transaction.create({
      data: {
        userId: params.userId,
        type: params.type,
        coinsChange: params.coinsChange || BigInt(0),
        cashChangeUsd: params.cashChangeUsd || 0,
        coinsBalanceAfter: user.coinsBalance,
        cashBalanceAfterUsd: user.cashBalanceUsd,
        description: params.description,
        referenceId: params.referenceId,
        referenceType: params.referenceType,
      },
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    throw error
  }
}

/**
 * Award coins to a user and create transaction record
 * Returns the updated user profile
 */
export async function awardCoins(
  userId: string,
  coins: number,
  description: string,
  referenceId?: number,
  referenceType?: string
): Promise<any> {
  return await prisma.$transaction(async (tx) => {
    // Update user balance
    const user = await tx.userProfile.update({
      where: { userId },
      data: {
        coinsBalance: { increment: BigInt(coins) },
        totalCoinsEarned: { increment: BigInt(coins) },
      },
    })

    // Create transaction record
    await createTransaction(
      {
        userId,
        type: 'coin_earned',
        coinsChange: BigInt(coins),
        description,
        referenceId,
        referenceType,
      },
      tx
    )

    return user
  })
}

/**
 * Convert coins to cash and create transaction record
 * Used during monthly conversion process
 */
export async function convertCoinsToUSD(
  userId: string,
  coins: bigint,
  cashUsd: number,
  conversionId: number,
  tx: Prisma.TransactionClient
): Promise<void> {
  // Update user balances
  await tx.userProfile.update({
    where: { userId },
    data: {
      coinsBalance: { decrement: coins },
      cashBalanceUsd: { increment: cashUsd },
      totalCashEarnedUsd: { increment: cashUsd },
    },
  })

  // Create transaction record
  await createTransaction(
    {
      userId,
      type: 'coin_conversion',
      coinsChange: -coins,
      cashChangeUsd: cashUsd,
      description: `Monthly coin conversion`,
      referenceId: conversionId,
      referenceType: 'coin_conversion',
    },
    tx
  )
}

/**
 * Process withdrawal and create transaction record
 */
export async function processWithdrawal(
  userId: string,
  amountUsd: number,
  withdrawalId: string,
  tx: Prisma.TransactionClient
): Promise<void> {
  // Update user balances
  await tx.userProfile.update({
    where: { userId },
    data: {
      cashBalanceUsd: { decrement: amountUsd },
      totalWithdrawnUsd: { increment: amountUsd },
    },
  })

  // Create transaction record
  await createTransaction(
    {
      userId,
      type: 'withdrawal',
      cashChangeUsd: -amountUsd,
      description: `Withdrawal via PayPal`,
      referenceType: 'withdrawal',
    },
    tx
  )
}

/**
 * Get user transaction history with pagination
 */
export async function getUserTransactions(
  userId: string,
  page: number = 1,
  perPage: number = 20,
  type?: string
): Promise<{ transactions: any[]; total: number; pages: number }> {
  const skip = (page - 1) * perPage

  const where: Prisma.TransactionWhereInput = { userId }
  if (type) {
    where.type = type
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip,
    }),
    prisma.transaction.count({ where }),
  ])

  return {
    transactions,
    total,
    pages: Math.ceil(total / perPage),
  }
}

