-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: User username unique
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Insert placeholder owner user (seed script will set real password)
INSERT INTO "User" ("id", "username", "passwordHash", "role", "createdAt")
VALUES ('owner-placeholder-id', 'owner', 'PLACEHOLDER', 'owner', NOW());

-- Add userId as nullable first (so backfill can happen before NOT NULL)
ALTER TABLE "CompletedBook" ADD COLUMN "userId" TEXT;
ALTER TABLE "CompletedBook" ADD COLUMN "isSeeded" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "DNFBook" ADD COLUMN "userId" TEXT;
ALTER TABLE "DNFBook" ADD COLUMN "isSeeded" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "WantToReadBook" ADD COLUMN "userId" TEXT;
ALTER TABLE "WantToReadBook" ADD COLUMN "isSeeded" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "YearlyGoal" ADD COLUMN "userId" TEXT;

-- Backfill: assign all existing records to the owner user
UPDATE "CompletedBook" SET "userId" = 'owner-placeholder-id' WHERE "userId" IS NULL;
UPDATE "DNFBook" SET "userId" = 'owner-placeholder-id' WHERE "userId" IS NULL;
UPDATE "WantToReadBook" SET "userId" = 'owner-placeholder-id' WHERE "userId" IS NULL;
UPDATE "YearlyGoal" SET "userId" = 'owner-placeholder-id' WHERE "userId" IS NULL;

-- Now enforce NOT NULL
ALTER TABLE "CompletedBook" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "DNFBook" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "WantToReadBook" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "YearlyGoal" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "CompletedBook" ADD CONSTRAINT "CompletedBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DNFBook" ADD CONSTRAINT "DNFBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WantToReadBook" ADD CONSTRAINT "WantToReadBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "YearlyGoal" ADD CONSTRAINT "YearlyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old YearlyGoal year unique index, add composite unique
DROP INDEX "YearlyGoal_year_key";
CREATE UNIQUE INDEX "YearlyGoal_userId_year_key" ON "YearlyGoal"("userId", "year");

-- Add indexes
CREATE INDEX "CompletedBook_userId_year_idx" ON "CompletedBook"("userId", "year");
CREATE INDEX "DNFBook_userId_idx" ON "DNFBook"("userId");
CREATE INDEX "WantToReadBook_userId_idx" ON "WantToReadBook"("userId");
