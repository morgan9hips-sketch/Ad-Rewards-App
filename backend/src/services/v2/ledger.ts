/**
 * V2 Ledger Service
 *
 * Implements the V2 data-ownership rules:
 *
 * 1. LEDGER SOURCE OF TRUTH
 *    Balance is computed by summing all signed amount_coins values for a user
 *    across v2_ledger_entries (positive = credit, negative = debit). This
 *    service never reads or writes balance columns on the V1 `user_profiles`
 *    table.
 *
 * 2. IDEMPOTENCY
 *    Every credit must supply an `idempotencyKey` (provider event id or
 *    admin action id). The unique DB constraint on `idempotency_key`
 *    silently returns the existing entry when the same key is submitted
 *    again, preventing double-credits on replay.
 *
 * 3. V1 SEPARATION
 *    This service only reads/writes the V2 tables (`v2_ledger_entries`,
 *    `v2_claims`). It never touches V1 tables.
 */

import { PrismaClient, V2LedgerEntryType } from '@prisma/client'

const prisma = new PrismaClient()

export { V2LedgerEntryType }

export interface CreditParams {
  userId: string
  /** Positive coin amount to add to the user's balance. */
  amountCoins: bigint
  type: V2LedgerEntryType
  idempotencyKey: string
  referenceId?: string
  referenceType?: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface DebitParams {
  userId: string
  /** Positive coin amount to deduct from the user's balance (stored negated). */
  amountCoins: bigint
  claimId?: number
  referenceId?: string
  referenceType?: string
  description?: string
}

/**
 * Credit a user's V2 ledger.
 *
 * Idempotent: if `idempotencyKey` already exists the existing entry is
 * returned and no new row is written.
 */
export async function creditLedger(params: CreditParams) {
  const {
    userId,
    amountCoins,
    type,
    idempotencyKey,
    referenceId,
    referenceType,
    description,
    metadata,
  } = params

  if (amountCoins <= 0n) {
    throw new Error('amountCoins must be positive for a credit')
  }

  if (type === V2LedgerEntryType.REDEEM) {
    throw new Error('Use debitLedger for REDEEM entries')
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.v2LedgerEntry.findUnique({
      where: { idempotencyKey },
    })
    if (existing) {
      return { entry: existing, created: false }
    }

    const entry = await tx.v2LedgerEntry.create({
      data: {
        userId,
        type,
        amountCoins, // positive
        idempotencyKey,
        referenceId,
        referenceType,
        description,
        metadata: metadata ? (metadata as object) : undefined,
      },
    })
    return { entry, created: true }
  })
}

/**
 * Debit a user's V2 ledger (internal helper – called by claimService).
 *
 * Stores the amount as a negative value so that a single SUM over all
 * `amount_coins` values yields the user's current balance.
 */
export async function debitLedger(
  params: DebitParams,
  tx?: Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
) {
  const {
    userId,
    amountCoins,
    claimId,
    referenceId,
    referenceType,
    description,
  } = params

  if (amountCoins <= 0n) {
    throw new Error('amountCoins must be positive for a debit')
  }

  const client = tx ?? prisma
  return client.v2LedgerEntry.create({
    data: {
      userId,
      type: V2LedgerEntryType.REDEEM,
      amountCoins: -amountCoins, // stored as negative
      claimId: claimId ?? null,
      referenceId: referenceId ?? null,
      referenceType: referenceType ?? null,
      description: description ?? null,
    },
  })
}

/**
 * Compute a user's V2 balance from ledger entries.
 *
 * balance = SUM(amount_coins)  — credits are positive, debits are negative.
 *
 * This is always derived – there is no stored balance column in V2.
 */
export async function getV2Balance(userId: string): Promise<bigint> {
  const result = await prisma.v2LedgerEntry.aggregate({
    where: { userId },
    _sum: { amountCoins: true },
  })

  return result._sum.amountCoins ?? 0n
}

/**
 * Compute a user's total earned coins from V2 ledger credits only.
 */
export async function getV2TotalEarned(userId: string): Promise<bigint> {
  const result = await prisma.v2LedgerEntry.aggregate({
    where: {
      userId,
      amountCoins: {
        gt: 0,
      },
    },
    _sum: { amountCoins: true },
  })

  return result._sum.amountCoins ?? 0n
}
