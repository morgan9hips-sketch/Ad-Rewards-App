-- AlterTable
ALTER TABLE "withdrawals" ADD COLUMN     "coins_withdrawn" INTEGER DEFAULT 15000,
ADD COLUMN     "rate_multiplier" DECIMAL(5,2);
