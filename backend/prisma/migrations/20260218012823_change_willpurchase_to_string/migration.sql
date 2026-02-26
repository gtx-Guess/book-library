-- AlterTable - Convert Boolean to TEXT (will convert true/false to 'true'/'false' strings)
ALTER TABLE "CompletedBook" ALTER COLUMN "willPurchase" SET DATA TYPE TEXT;
ALTER TABLE "DNFBook" ALTER COLUMN "willPurchase" SET DATA TYPE TEXT;
ALTER TABLE "WantToReadBook" ALTER COLUMN "willPurchase" SET DATA TYPE TEXT;

-- Update data: Convert 'true'/'false' strings to 'yes'/'no'
UPDATE "CompletedBook" SET "willPurchase" = 'yes' WHERE "willPurchase" = 'true';
UPDATE "CompletedBook" SET "willPurchase" = 'no' WHERE "willPurchase" = 'false';

UPDATE "DNFBook" SET "willPurchase" = 'yes' WHERE "willPurchase" = 'true';
UPDATE "DNFBook" SET "willPurchase" = 'no' WHERE "willPurchase" = 'false';

UPDATE "WantToReadBook" SET "willPurchase" = 'yes' WHERE "willPurchase" = 'true';
UPDATE "WantToReadBook" SET "willPurchase" = 'no' WHERE "willPurchase" = 'false';
