import { PrismaClient, V2LedgerEntryType } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Return the current V2 coin balance for a user.
 * Balance = SUM(amount_coins) across all ledger entries.
 * Returns 0n if the user has no entries yet.
 */
export async function getV2Balance(userId: string): Promise<bigint> {
  const result = await prisma.v2LedgerEntry.aggregate({
    where: { userId },
    _sum: { amountCoins: true },
  })
  return result._sum.amountCoins ?? BigInt(0)
}

/**
 * Apply an admin credit to a user's V2 ledger.
 *
 * @param userId        Target user
 * @param amountCoins   Positive integer (coins to credit)
 * @param idempotencyKey Caller-supplied idempotency key (unique per credit)
 * @param note          Optional human-readable note
 */
export async function adminCredit(
  userId: string,
  amountCoins: bigint,
  idempotencyKey: string,
  note?: string,
) {
  if (amountCoins <= BigInt(0)) {
    throw new Error('amountCoins must be positive')
  }

  return prisma.v2LedgerEntry.create({
    data: {
      userId,
      amountCoins,
      entryType: V2LedgerEntryType.ADMIN_CREDIT,
      idempotencyKey,
      note,
    },
  })
}

/**
 * Debit coins from a user's V2 ledger (e.g., when a claim is fulfilled).
 *
 * @param userId      Target user
 * @param amountCoins Positive integer (coins to debit — stored as negative)
 * @param note        Optional human-readable note
 */
export async function debitCoins(
  userId: string,
  amountCoins: bigint,
  note?: string,
) {
  if (amountCoins <= BigInt(0)) {
    throw new Error('amountCoins must be positive')
  }

  return prisma.v2LedgerEntry.create({
    data: {
      userId,
      amountCoins: -amountCoins,
      entryType: V2LedgerEntryType.REDEEM,
      note,
    },
  })
}
