-- CreateEnum
CREATE TYPE "V2LedgerEntryType" AS ENUM ('ADMIN_CREDIT', 'EARN', 'REDEEM', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "V2ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELED');

-- CreateTable: v2_ledger_entries
CREATE TABLE "v2_ledger_entries" (
    "id"               TEXT          NOT NULL,
    "user_id"          TEXT          NOT NULL,
    "amount_coins"     BIGINT        NOT NULL,
    "entry_type"       "V2LedgerEntryType" NOT NULL,
    "idempotency_key"  TEXT,
    "note"             TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable: v2_rewards (reward catalog)
CREATE TABLE "v2_rewards" (
    "id"          TEXT          NOT NULL,
    "name"        TEXT          NOT NULL,
    "description" TEXT,
    "cost_coins"  INTEGER       NOT NULL,
    "is_active"   BOOLEAN       NOT NULL DEFAULT TRUE,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable: v2_claims
CREATE TABLE "v2_claims" (
    "id"           TEXT           NOT NULL,
    "user_id"      TEXT           NOT NULL,
    "reward_id"    TEXT           NOT NULL,
    "status"       "V2ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "amount_coins" BIGINT         NOT NULL,
    "created_at"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3)  NOT NULL,

    CONSTRAINT "v2_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "v2_ledger_entries_idempotency_key_key" ON "v2_ledger_entries"("idempotency_key");
CREATE INDEX "v2_ledger_entries_user_id_idx"   ON "v2_ledger_entries"("user_id");
CREATE INDEX "v2_ledger_entries_created_at_idx" ON "v2_ledger_entries"("created_at");

CREATE INDEX "v2_rewards_is_active_idx" ON "v2_rewards"("is_active");

CREATE INDEX "v2_claims_user_id_idx" ON "v2_claims"("user_id");
CREATE INDEX "v2_claims_status_idx"   ON "v2_claims"("status");

-- AddForeignKey
ALTER TABLE "v2_claims" ADD CONSTRAINT "v2_claims_reward_id_fkey"
    FOREIGN KEY ("reward_id") REFERENCES "v2_rewards"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
