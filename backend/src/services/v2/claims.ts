/**
 * V2 Claims Service
 *
 * Implements the V2 claim lifecycle:
 *
 * 3. CLAIM LIFECYCLE
 *    - A claim is created with status='pending'.
 *    - Fulfillment atomically:
 *        a) creates a debit ledger entry for the claim amount, and
 *        b) transitions the claim to status='fulfilled'.
 *    - Attempting to fulfill an already-fulfilled (or rejected) claim
 *      returns an error without modifying any data.
 *
 * V1 SEPARATION
 *    This service only reads/writes V2 tables. It never touches V1 tables.
 */

import { PrismaClient } from '@prisma/client'
import { debitLedger } from './ledger.js'

const prisma = new PrismaClient()

export interface CreateClaimParams {
  userId: string
  amountCoins: bigint
  description?: string
  metadata?: Record<string, unknown>
}

/**
 * Create a new pending claim.
 */
export async function createClaim(params: CreateClaimParams) {
  const { userId, amountCoins, description, metadata } = params

  if (amountCoins <= 0n) {
    throw new Error('amountCoins must be positive')
  }

  return prisma.v2Claim.create({
    data: {
      userId,
      status: 'pending',
      amountCoins,
      description: description ?? null,
      metadata: metadata ? (metadata as object) : undefined,
    },
  })
}

/**
 * Fulfill a pending claim.
 *
 * Atomically creates a debit ledger entry and marks the claim as
 * 'fulfilled'. Throws if the claim does not exist or is not pending.
 */
export async function fulfillClaim(claimId: number) {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.v2Claim.findUnique({ where: { id: claimId } })

    if (!claim) {
      throw new Error(`Claim ${claimId} not found`)
    }
    if (claim.status !== 'pending') {
      throw new Error(
        `Claim ${claimId} cannot be fulfilled (status: ${claim.status})`,
      )
    }

    // Create the debit ledger entry linked to this claim.
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

    // Transition claim to fulfilled.
    return tx.v2Claim.update({
      where: { id: claimId },
      data: {
        status: 'fulfilled',
        fulfilledAt: new Date(),
      },
    })
  })
}
