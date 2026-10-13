ALTER TABLE "Listing" ADD COLUMN "condition" TEXT NOT NULL DEFAULT 'USED';
CREATE INDEX "Listing_status_condition_createdAt_idx" ON "Listing"("status", "condition", "createdAt");
