-- CreateTable
CREATE TABLE "CurrentlyReadingBook" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isSeeded" BOOLEAN NOT NULL DEFAULT false,
    "startedDate" TIMESTAMP(3),
    "currentPage" INTEGER,
    "own" BOOLEAN,
    "willPurchase" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrentlyReadingBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CurrentlyReadingBook_userId_idx" ON "CurrentlyReadingBook"("userId");

-- AddForeignKey
ALTER TABLE "CurrentlyReadingBook" ADD CONSTRAINT "CurrentlyReadingBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentlyReadingBook" ADD CONSTRAINT "CurrentlyReadingBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
