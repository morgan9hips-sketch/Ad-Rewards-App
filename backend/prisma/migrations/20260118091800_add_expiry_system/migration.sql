-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "expired_balances" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "expiry_type" TEXT NOT NULL,
    "amount" DECIMAL(12,4) NOT NULL,
    "cash_value" DECIMAL(12,4) NOT NULL,
    "reason" TEXT NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expired_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_profiles_last_login_idx" ON "user_profiles"("last_login");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "expired_balances_user_id_idx" ON "expired_balances"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "expired_balances_expired_at_idx" ON "expired_balances"("expired_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "expired_balances_expiry_type_idx" ON "expired_balances"("expiry_type");

-- AddForeignKey
ALTER TABLE "expired_balances" ADD CONSTRAINT "expired_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
