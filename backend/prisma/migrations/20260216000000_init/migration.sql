-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "googleBooksId" TEXT,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "description" TEXT,
    "coverImage" TEXT,
    "pageCount" INTEGER,
    "publisher" TEXT,
    "publishedDate" TEXT,
    "categories" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletedBook" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "completedDate" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "pageCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletedBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YearlyGoal" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "goalCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YearlyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_googleBooksId_key" ON "Book"("googleBooksId");

-- CreateIndex
CREATE INDEX "CompletedBook_year_idx" ON "CompletedBook"("year");

-- CreateIndex
CREATE UNIQUE INDEX "YearlyGoal_year_key" ON "YearlyGoal"("year");

-- AddForeignKey
ALTER TABLE "CompletedBook" ADD CONSTRAINT "CompletedBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
