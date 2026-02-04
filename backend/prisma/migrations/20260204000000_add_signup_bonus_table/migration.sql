-- CreateTable
CREATE TABLE "signup_bonuses" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "user_number_in_region" INTEGER NOT NULL,
    "bonus_coins" INTEGER NOT NULL DEFAULT 500,
    "bonus_value_zar" DECIMAL(10,4) NOT NULL DEFAULT 50.00,
    "eligible" BOOLEAN NOT NULL DEFAULT true,
    "credited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signup_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "signup_bonuses_user_id_key" ON "signup_bonuses"("user_id");

-- CreateIndex
CREATE INDEX "signup_bonuses_country_code_idx" ON "signup_bonuses"("country_code");

-- CreateIndex
CREATE INDEX "signup_bonuses_eligible_idx" ON "signup_bonuses"("eligible");

-- AddForeignKey
ALTER TABLE "signup_bonuses" ADD CONSTRAINT "signup_bonuses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
