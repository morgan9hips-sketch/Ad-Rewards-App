-- CreateTable
CREATE TABLE "v2_tasks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "geo_countries" TEXT[],
    "base_reward_usd" DOUBLE PRECISION NOT NULL,
    "reward_coins" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_task_completions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider_reference" TEXT,
    "revenue_earned_usd" DOUBLE PRECISION,
    "coins_awarded" INTEGER NOT NULL DEFAULT 0,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_task_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "v2_tasks_is_active_idx" ON "v2_tasks"("is_active");

-- CreateIndex
CREATE INDEX "v2_tasks_provider_idx" ON "v2_tasks"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "v2_task_completions_user_id_task_id_key" ON "v2_task_completions"("user_id", "task_id");

-- CreateIndex
CREATE INDEX "v2_task_completions_user_id_idx" ON "v2_task_completions"("user_id");

-- CreateIndex
CREATE INDEX "v2_task_completions_task_id_idx" ON "v2_task_completions"("task_id");

-- CreateIndex
CREATE INDEX "v2_task_completions_status_idx" ON "v2_task_completions"("status");

-- AddForeignKey
ALTER TABLE "v2_task_completions" ADD CONSTRAINT "v2_task_completions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "v2_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
