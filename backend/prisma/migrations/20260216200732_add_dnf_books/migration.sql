-- CreateTable
CREATE TABLE "DNFBook" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "own" BOOLEAN,
    "willPurchase" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DNFBook_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DNFBook" ADD CONSTRAINT "DNFBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
