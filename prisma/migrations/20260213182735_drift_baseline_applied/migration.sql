-- CreateEnum
CREATE TYPE "OfferDecisionKind" AS ENUM ('ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PolicyStrikeAction" AS ENUM ('WARN');
-- AlterEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ListingStatus' AND n.nspname = current_schema()
  ) THEN
    EXECUTE 'CREATE TYPE "ListingStatus" AS ENUM (''DRAFT'', ''ACTIVE'', ''ENDED'', ''SOLD'', ''SUSPENDED'', ''DELETED'')';
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ListingStatus' AND n.nspname = current_schema()
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'ListingStatus' AND n.nspname = current_schema() AND e.enumlabel = 'DELETED'
  ) THEN
    EXECUTE 'ALTER TYPE "ListingStatus" ADD VALUE ''DELETED'';';
  END IF;
END;
$$;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "buyNowEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "previousStatus" "ListingStatus";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "threadId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "badgeConsistentSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "badgeFastResponder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "badgeNewSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "bankBsb" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "payidEmail" TEXT,
ADD COLUMN     "payidMobile" TEXT;

-- CreateTable
CREATE TABLE "ActivitySession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalActiveMs" INTEGER NOT NULL DEFAULT 0,
    "totalIdleMs" INTEGER NOT NULL DEFAULT 0,
    "lastPath" TEXT,
    "lastReferrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "reportId" TEXT,
    "listingId" TEXT,
    "userId" TEXT,
    "meta" JSONB,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "data" JSONB,

    CONSTRAINT "AdminEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ListingAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingQuestion" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ListingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerLastReadAt" TIMESTAMP(3),
    "sellerLastReadAt" TIMESTAMP(3),
    "buyerDeletedAt" TIMESTAMP(3),
    "sellerDeletedAt" TIMESTAMP(3),

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferDecision" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "decision" "OfferDecisionKind" NOT NULL,
    "orderId" TEXT,

    CONSTRAINT "OfferDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferMax" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "maxAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferMax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyStrike" (
    "id" TEXT NOT NULL,
    "action" "PolicyStrikeAction" NOT NULL DEFAULT 'WARN',
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "clearedAt" TIMESTAMP(3),
    "clearedReason" TEXT,
    "userId" TEXT NOT NULL,
    "clearedById" TEXT,
    "reportId" TEXT,
    "listingId" TEXT,

    CONSTRAINT "PolicyStrike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivitySession_lastSeenAt_idx" ON "ActivitySession"("lastSeenAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySession_sessionId_key" ON "ActivitySession"("sessionId" ASC);

-- CreateIndex
CREATE INDEX "ActivitySession_userId_idx" ON "ActivitySession"("userId" ASC);

-- CreateIndex
CREATE INDEX "ListingAnswer_questionId_idx" ON "ListingAnswer"("questionId" ASC);

-- CreateIndex
CREATE INDEX "ListingAnswer_userId_idx" ON "ListingAnswer"("userId" ASC);

-- CreateIndex
CREATE INDEX "ListingQuestion_listingId_idx" ON "ListingQuestion"("listingId" ASC);

-- CreateIndex
CREATE INDEX "ListingQuestion_userId_idx" ON "ListingQuestion"("userId" ASC);

-- CreateIndex
CREATE INDEX "MessageThread_buyerId_idx" ON "MessageThread"("buyerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_listingId_buyerId_key" ON "MessageThread"("listingId" ASC, "buyerId" ASC);

-- CreateIndex
CREATE INDEX "MessageThread_listingId_idx" ON "MessageThread"("listingId" ASC);

-- CreateIndex
CREATE INDEX "MessageThread_sellerId_idx" ON "MessageThread"("sellerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OfferDecision_bidId_key" ON "OfferDecision"("bidId" ASC);

-- CreateIndex
CREATE INDEX "OfferDecision_buyerId_idx" ON "OfferDecision"("buyerId" ASC);

-- CreateIndex
CREATE INDEX "OfferDecision_decision_idx" ON "OfferDecision"("decision" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OfferDecision_listingId_bidId_key" ON "OfferDecision"("listingId" ASC, "bidId" ASC);

-- CreateIndex
CREATE INDEX "OfferDecision_listingId_idx" ON "OfferDecision"("listingId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OfferDecision_orderId_key" ON "OfferDecision"("orderId" ASC);

-- CreateIndex
CREATE INDEX "OfferDecision_sellerId_idx" ON "OfferDecision"("sellerId" ASC);

-- CreateIndex
CREATE INDEX "OfferMax_bidderId_idx" ON "OfferMax"("bidderId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OfferMax_listingId_bidderId_key" ON "OfferMax"("listingId" ASC, "bidderId" ASC);

-- CreateIndex
CREATE INDEX "OfferMax_listingId_idx" ON "OfferMax"("listingId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash" ASC);

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId" ASC);

-- CreateIndex
CREATE INDEX "PolicyStrike_expiresAt_idx" ON "PolicyStrike"("expiresAt" ASC);

-- CreateIndex
CREATE INDEX "PolicyStrike_listingId_idx" ON "PolicyStrike"("listingId" ASC);

-- CreateIndex
CREATE INDEX "PolicyStrike_reportId_idx" ON "PolicyStrike"("reportId" ASC);

-- CreateIndex
CREATE INDEX "PolicyStrike_userId_idx" ON "PolicyStrike"("userId" ASC);

-- CreateIndex
CREATE INDEX "Message_threadId_idx" ON "Message"("threadId" ASC);

-- AddForeignKey
ALTER TABLE "ActivitySession" ADD CONSTRAINT "ActivitySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAnswer" ADD CONSTRAINT "ListingAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ListingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAnswer" ADD CONSTRAINT "ListingAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingQuestion" ADD CONSTRAINT "ListingQuestion_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingQuestion" ADD CONSTRAINT "ListingQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferDecision" ADD CONSTRAINT "OfferDecision_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferDecision" ADD CONSTRAINT "OfferDecision_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferDecision" ADD CONSTRAINT "OfferDecision_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferDecision" ADD CONSTRAINT "OfferDecision_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferDecision" ADD CONSTRAINT "OfferDecision_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferMax" ADD CONSTRAINT "OfferMax_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferMax" ADD CONSTRAINT "OfferMax_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyStrike" ADD CONSTRAINT "PolicyStrike_clearedById_fkey" FOREIGN KEY ("clearedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyStrike" ADD CONSTRAINT "PolicyStrike_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyStrike" ADD CONSTRAINT "PolicyStrike_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyStrike" ADD CONSTRAINT "PolicyStrike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
