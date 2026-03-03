-- AlterTable
ALTER TABLE "InviteCode" ALTER COLUMN "maxUses" SET DEFAULT 20;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
