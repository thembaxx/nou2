ALTER TABLE "Enquiry" ADD COLUMN "notificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
 ADD COLUMN "notificationAttemptedAt" TIMESTAMP(3),
 ADD COLUMN "notificationProviderId" TEXT,
 ADD COLUMN "notificationAttempts" INTEGER NOT NULL DEFAULT 0;
