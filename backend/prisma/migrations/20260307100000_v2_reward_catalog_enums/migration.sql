-- V2 Reward Catalog + Enums Migration
--
-- This migration upgrades the V2 tables that were created in
-- 20260307000000_add_v2_ledger_and_claims to match the full A1 spec:
--
--   1. Replaces the free-text `entry_type` column in v2_ledger_entries with a
--      proper V2LedgerEntryType enum (ADMIN_CREDIT, EARN, REDEEM, ADJUSTMENT).
--      Signed amount_coins (positive = credit, negative = debit) now convey
--      direction; the type conveys purpose.
--
--   2. Adds a `metadata` JSONB column to v2_ledger_entries.
--
--   3. Creates the v2_rewards catalog table (title, description, cost_coins,
--      is_active, timestamps).
--
--   4. Adds reward_id, fulfillment_ref, and notes columns to v2_claims.
--      Renames created_at → requested_at to match the spec field name.
--
--   5. Replaces the free-text `status` column in v2_claims with a proper
--      V2ClaimStatus enum (PENDING, APPROVED, FULFILLED, REJECTED, CANCELED).

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Create enum types
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TYPE "V2LedgerEntryType" AS ENUM (
    'ADMIN_CREDIT',
    'EARN',
    'REDEEM',
    'ADJUSTMENT'
);

CREATE TYPE "V2ClaimStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'FULFILLED',
    'REJECTED',
    'CANCELED'
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Upgrade v2_ledger_entries
-- ──────────────────────────────────────────────────────────────────────────────

-- Add the typed column with a safe default for any pre-existing rows.
ALTER TABLE "v2_ledger_entries"
    ADD COLUMN "type" "V2LedgerEntryType" NOT NULL DEFAULT 'EARN';

-- Migrate legacy free-text values to enum values.
UPDATE "v2_ledger_entries"
    SET "type" = 'ADMIN_CREDIT'
    WHERE "entry_type" = 'credit';

UPDATE "v2_ledger_entries"
    SET "type" = 'REDEEM'
    WHERE "entry_type" = 'debit';

-- Drop the default now that existing rows have been migrated.
ALTER TABLE "v2_ledger_entries"
    ALTER COLUMN "type" DROP DEFAULT;

-- Remove the old free-text column.
ALTER TABLE "v2_ledger_entries"
    DROP COLUMN "entry_type";

-- Add metadata JSON column.
ALTER TABLE "v2_ledger_entries"
    ADD COLUMN "metadata" JSONB;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Create v2_rewards catalog table
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE "v2_rewards" (
    "id"          SERIAL       NOT NULL,
    "title"       TEXT         NOT NULL,
    "description" TEXT,
    "cost_coins"  INTEGER      NOT NULL,
    "is_active"   BOOLEAN      NOT NULL DEFAULT true,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_rewards_pkey" PRIMARY KEY ("id")
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Upgrade v2_claims
-- ──────────────────────────────────────────────────────────────────────────────

-- Rename created_at → requested_at (matches spec field name).
ALTER TABLE "v2_claims"
    RENAME COLUMN "created_at" TO "requested_at";

-- Add new columns.
ALTER TABLE "v2_claims"
    ADD COLUMN "reward_id"        INTEGER,
    ADD COLUMN "fulfillment_ref"  TEXT,
    ADD COLUMN "notes"            TEXT;

-- Migrate status column to enum:
--   a) Add a new typed column.
ALTER TABLE "v2_claims"
    ADD COLUMN "status_new" "V2ClaimStatus" NOT NULL DEFAULT 'PENDING';

--   b) Populate from legacy string values.
UPDATE "v2_claims"
    SET "status_new" = 'PENDING'
    WHERE "status" = 'pending';

UPDATE "v2_claims"
    SET "status_new" = 'FULFILLED'
    WHERE "status" = 'fulfilled';

UPDATE "v2_claims"
    SET "status_new" = 'REJECTED'
    WHERE "status" = 'rejected';

--   c) Drop the old text column and rename the new one.
ALTER TABLE "v2_claims"
    DROP COLUMN "status";

ALTER TABLE "v2_claims"
    RENAME COLUMN "status_new" TO "status";

-- Drop the migration default now that all rows have valid enum values.
ALTER TABLE "v2_claims"
    ALTER COLUMN "status" DROP DEFAULT;

-- Re-apply application default.
ALTER TABLE "v2_claims"
    ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Add foreign key: v2_claims.reward_id → v2_rewards.id
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE "v2_claims"
    ADD CONSTRAINT "v2_claims_reward_id_fkey"
    FOREIGN KEY ("reward_id")
    REFERENCES "v2_rewards"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. Rebuild status index (old index referenced the now-dropped text column)
-- ──────────────────────────────────────────────────────────────────────────────

DROP INDEX IF EXISTS "v2_claims_status_idx";
CREATE INDEX "v2_claims_status_idx" ON "v2_claims"("status");
