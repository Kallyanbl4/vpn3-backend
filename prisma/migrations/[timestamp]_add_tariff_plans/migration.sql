-- CreateTable
CREATE TABLE "TariffPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "features" JSONB NOT NULL,
    "priceDaily" DOUBLE PRECISION,
    "priceMonthly" DOUBLE PRECISION,
    "priceQuarterly" DOUBLE PRECISION,
    "priceAnnually" DOUBLE PRECISION,
    "availableBillingPeriods" TEXT[],
    "customPeriodEnabled" BOOLEAN NOT NULL DEFAULT false,
    "customPeriodMinDays" INTEGER,
    "customPeriodMaxDays" INTEGER,
    "customPeriodDailyPrice" DOUBLE PRECISION,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "limits" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TariffPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TariffPlan_code_key" ON "TariffPlan"("code");

-- Add timestamps to User if they don't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;