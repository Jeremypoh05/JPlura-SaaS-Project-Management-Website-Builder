-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ticketId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_ticketId_idx" ON "Notification"("ticketId");
