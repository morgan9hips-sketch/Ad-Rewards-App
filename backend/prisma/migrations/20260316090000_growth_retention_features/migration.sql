-- Add growth and retention fields
ALTER TABLE "user_profiles" ADD "login_streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_profiles" ADD "last_login_date" DATE;
ALTER TABLE "user_profiles" ADD "task_win_streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_profiles" ADD "referral_earn_rate" NUMERIC(5, 4) NOT NULL DEFAULT 0.1000;

-- Add monthly leaderboard awards table for idempotent payouts
CREATE TABLE "monthly_leaderboard_awards" (
  "id" SERIAL NOT NULL,
  "month" VARCHAR(7) NOT NULL,
  "user_id" TEXT NOT NULL,
  "rank" INTEGER NOT NULL,
  "coins_awarded" INTEGER NOT NULL,
  "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "monthly_leaderboard_awards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "monthly_leaderboard_awards_month_user_id_key"
ON "monthly_leaderboard_awards"("month", "user_id");

CREATE INDEX "monthly_leaderboard_awards_month_idx"
ON "monthly_leaderboard_awards"("month");

CREATE INDEX "monthly_leaderboard_awards_user_id_idx"
ON "monthly_leaderboard_awards"("user_id");

ALTER TABLE "monthly_leaderboard_awards"
ADD CONSTRAINT "monthly_leaderboard_awards_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
