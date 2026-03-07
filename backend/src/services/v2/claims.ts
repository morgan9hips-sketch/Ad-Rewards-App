/**
 * V2 Claims Service
 *
 * Implements the V2 claim lifecycle:
 *
 * 3. CLAIM LIFECYCLE
 *    - A claim is created with status=PENDING.
 *    - Fulfillment atomically:
 *        a) creates a REDEEM debit ledger entry for the claim amount, and
 *        b) transitions the claim to status=FULFILLED.
 *    - Attempting to fulfill an already-fulfilled (or rejected/canceled) claim
 *      returns an error without modifying any data.
 *
 * V1 SEPARATION
 *    This service only reads/writes V2 tables. It never touches V1 tables.
 */

import { PrismaClient, V2ClaimStatus } from '@prisma/client'
import { debitLedger } from './ledger.js'

const prisma = new PrismaClient()

export { V2ClaimStatus }

export interface CreateClaimParams {
  userId: string
  amountCoins: bigint
  rewardId?: number
  description?: string
  metadata?: Record<string, unknown>
}

/**
 * Create a new pending claim.
 */
export async function createClaim(params: CreateClaimParams) {
  const { userId, amountCoins, rewardId, description, metadata } = params

  if (amountCoins <= 0n) {
    throw new Error('amountCoins must be positive')
  }

  return prisma.v2Claim.create({
    data: {
      userId,
      status: V2ClaimStatus.PENDING,
      amountCoins,
      rewardId: rewardId ?? null,
      description: description ?? null,
      metadata: metadata ? (metadata as object) : undefined,
    },
  })
}

/**
 * Fulfill a pending claim.
 *
 * Atomically creates a REDEEM debit ledger entry and marks the claim as
 * FULFILLED. Throws if the claim does not exist or is not in PENDING status.
 */
export async function fulfillClaim(claimId: number, fulfillmentRef?: string, notes?: string) {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.v2Claim.findUnique({ where: { id: claimId } })

    if (!claim) {
      throw new Error(`Claim ${claimId} not found`)
    }
    if (claim.status !== V2ClaimStatus.PENDING) {
      throw new Error(
        `Claim ${claimId} cannot be fulfilled (status: ${claim.status})`,
      )
    }

    // Create the REDEEM debit ledger entry linked to this claim.
    await debitLedger(
      {
        userId: claim.userId,
        amountCoins: claim.amountCoins,
        claimId: claim.id,
        referenceType: 'claim_fulfillment',
        referenceId: String(claim.id),
        description: claim.description ?? undefined,
      },
      tx as unknown as Parameters<typeof debitLedger>[1],
    )

    // Transition claim to FULFILLED.
    return tx.v2Claim.update({
      where: { id: claimId },
      data: {
        status: V2ClaimStatus.FULFILLED,
        fulfilledAt: new Date(),
        fulfillmentRef: fulfillmentRef ?? null,
        notes: notes ?? null,
      },
    })
  })
}
