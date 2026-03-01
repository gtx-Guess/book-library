-- AlterTable
ALTER TABLE "CompletedBook" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "WebAuthnCredential" ALTER COLUMN "transports" DROP DEFAULT;
