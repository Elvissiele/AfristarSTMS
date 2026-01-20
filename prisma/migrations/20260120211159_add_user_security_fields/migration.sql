-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTemporaryPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "personalEmail" TEXT;
