-- V2 Data Ownership Rules
--
-- Rule 1 – Ledger source of truth:
--   Balance = SUM(amount_coins) WHERE entry_type='credit'
--           - SUM(amount_coins) WHERE entry_type='debit'
--   No direct "set balance" writes are allowed through V2 code paths.
--
-- Rule 2 – Idempotency:
--   The UNIQUE constraint on idempotency_key guarantees that replaying the same
--   provider event id (e.g. AdMob impression id) or admin action id will fail at
--   the database level, preventing duplicate credits.
--
-- Rule 3 – Claim lifecycle:
--   Claims are created with status='pending'. Fulfillment inserts a debit entry
--   into v2_ledger_entries and updates the claim to status='fulfilled'.
--
-- Rule 4 – V1 separation:
--   These tables are exclusively owned by V2 code. V2 routes never write to the
--   V1 tables (user_profiles, transactions, ad_views, withdrawals, …).

-- CreateTable v2_ledger_entries
CREATE TABLE "v2_ledger_entries" (
    "id"               SERIAL       NOT NULL,
    "user_id"          TEXT         NOT NULL,
    "entry_type"       TEXT         NOT NULL,
    "amount_coins"     BIGINT       NOT NULL,
    "description"      TEXT,
    "idempotency_key"  TEXT,
    "reference_id"     TEXT,
    "reference_type"   TEXT,
    "claim_id"         INTEGER,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable v2_claims
CREATE TABLE "v2_claims" (
    "id"           SERIAL       NOT NULL,
    "user_id"      TEXT         NOT NULL,
    "status"       TEXT         NOT NULL DEFAULT 'pending',
    "amount_coins" BIGINT       NOT NULL,
    "description"  TEXT,
    "metadata"     JSONB,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilled_at" TIMESTAMP(3),

    CONSTRAINT "v2_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "v2_ledger_entries_idempotency_key_key" ON "v2_ledger_entries"("idempotency_key");

-- CreateIndex
CREATE INDEX "v2_ledger_entries_user_id_idx"      ON "v2_ledger_entries"("user_id");
CREATE INDEX "v2_ledger_entries_reference_id_idx"  ON "v2_ledger_entries"("reference_id");
CREATE INDEX "v2_ledger_entries_claim_id_idx"      ON "v2_ledger_entries"("claim_id");
CREATE INDEX "v2_ledger_entries_created_at_idx"    ON "v2_ledger_entries"("created_at");

-- CreateIndex
CREATE INDEX "v2_claims_user_id_idx" ON "v2_claims"("user_id");
CREATE INDEX "v2_claims_status_idx"  ON "v2_claims"("status");

-- AddForeignKey
ALTER TABLE "v2_ledger_entries"
    ADD CONSTRAINT "v2_ledger_entries_claim_id_fkey"
    FOREIGN KEY ("claim_id")
    REFERENCES "v2_claims"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
