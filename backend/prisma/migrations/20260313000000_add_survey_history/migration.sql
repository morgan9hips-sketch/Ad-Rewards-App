-- CreateTable
CREATE TABLE "survey_history" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'cpx_research',
    "trans_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "hash_valid" BOOLEAN NOT NULL DEFAULT false,
    "source_ip" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_history_trans_id_key" ON "survey_history"("trans_id");

-- CreateIndex
CREATE INDEX "survey_history_user_id_idx" ON "survey_history"("user_id");

-- CreateIndex
CREATE INDEX "survey_history_status_idx" ON "survey_history"("status");
