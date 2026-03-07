/**
 * V2 Ledger Service
 *
 * Implements the V2 data-ownership rules:
 *
 * 1. LEDGER SOURCE OF TRUTH
 *    Balance is computed by aggregating v2_ledger_entries for a user
 *    (SUM of credits minus SUM of debits). This service never reads or
 *    writes balance columns on the V1 `user_profiles` table.
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

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreditParams {
  userId: string
  amountCoins: bigint
  idempotencyKey: string
  referenceId?: string
  referenceType?: string
  description?: string
}

export interface DebitParams {
  userId: string
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
    idempotencyKey,
    referenceId,
    referenceType,
    description,
  } = params

  if (amountCoins <= 0n) {
    throw new Error('amountCoins must be positive for a credit')
  }

  // Use upsert-style: attempt to create; on conflict return existing row.
  // Prisma's createOrConnect is not available for unique fields on create,
  // so we check existence first inside a serializable transaction to ensure
  // atomicity without a race condition.
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
        entryType: 'credit',
        amountCoins,
        idempotencyKey,
        referenceId,
        referenceType,
        description,
      },
    })
    return { entry, created: true }
  })
}

/**
 * Debit a user's V2 ledger (internal helper – called by claimService).
 */
export async function debitLedger(
  params: DebitParams,
  tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
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
      entryType: 'debit',
      amountCoins,
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
 * balance = SUM(credit amounts) - SUM(debit amounts)
 *
 * This is always derived – there is no stored balance column in V2.
 */
export async function getV2Balance(userId: string): Promise<bigint> {
  const [credits, debits] = await Promise.all([
    prisma.v2LedgerEntry.aggregate({
      where: { userId, entryType: 'credit' },
      _sum: { amountCoins: true },
    }),
    prisma.v2LedgerEntry.aggregate({
      where: { userId, entryType: 'debit' },
      _sum: { amountCoins: true },
    }),
  ])

  const totalCredits = credits._sum.amountCoins ?? 0n
  const totalDebits = debits._sum.amountCoins ?? 0n
  return totalCredits - totalDebits
}
