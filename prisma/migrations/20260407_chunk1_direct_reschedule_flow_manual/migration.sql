-- Chunk 1 direct reschedule flow: additive-only migration
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "rescheduleRequestedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "rescheduleRequestedByRole" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "rescheduleReason" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "rescheduleResolvedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "rescheduleCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill safe defaults where needed
UPDATE "Order" SET "rescheduleCount" = 0 WHERE "rescheduleCount" IS NULL;
