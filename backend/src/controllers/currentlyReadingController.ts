import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllCurrentlyReadingBooks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page, limit } = req.query;

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [books, totalCount] = await Promise.all([
        prisma.currentlyReadingBook.findMany({
          where: { userId },
          include: { book: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.currentlyReadingBook.count({ where: { userId } }),
      ]);

      return res.json({
        books,
        pagination: { page: pageNum, limit: limitNum, totalCount, totalPages: Math.ceil(totalCount / limitNum) },
      });
    }

    const books = await prisma.currentlyReadingBook.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(books);
  } catch (error) {
    console.error('Error fetching currently reading books:', error);
    res.status(500).json({ error: 'Failed to fetch currently reading books' });
  }
};

export const addCurrentlyReadingBook = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      googleBooksId,
      title,
      authors,
      description,
      coverImage,
      pageCount,
      publisher,
      publishedDate,
      categories,
      own,
      willPurchase,
      startedDate,
      currentPage,
    } = req.body;

    let book;
    if (googleBooksId) {
      book = await prisma.book.upsert({
        where: { googleBooksId },
        update: { title, authors, description, coverImage, pageCount, publisher, publishedDate, categories },
        create: { googleBooksId, title, authors, description, coverImage, pageCount, publisher, publishedDate, categories },
      });
    } else {
      book = await prisma.book.create({
        data: { title, authors, description, coverImage, pageCount, publisher, publishedDate, categories },
      });
    }

    const existingCurrentlyReading = await prisma.currentlyReadingBook.findFirst({
      where: { bookId: book.id, userId },
    });

    if (existingCurrentlyReading) {
      return res.status(400).json({ error: 'This book is already in your "Currently Reading" list' });
    }

    const existingCompletedBook = await prisma.completedBook.findFirst({
      where: { bookId: book.id, userId },
    });

    if (existingCompletedBook) {
      return res.status(400).json({
        error: `This book is already in your ${existingCompletedBook.year} library`,
        year: existingCompletedBook.year,
      });
    }

    const existingDNFBook = await prisma.dNFBook.findFirst({
      where: { bookId: book.id, userId },
    });

    if (existingDNFBook) {
      return res.status(400).json({ error: 'This book is already in your "DNF list"' });
    }

    const currentlyReadingBook = await prisma.$transaction(async (tx) => {
      // Remove from Want to Read list atomically
      await tx.wantToReadBook.deleteMany({ where: { bookId: book.id, userId } });

      return tx.currentlyReadingBook.create({
        data: {
          bookId: book.id,
          userId,
          own: own !== undefined ? own : null,
          willPurchase: willPurchase !== undefined ? willPurchase : null,
          startedDate: startedDate ? new Date(startedDate) : null,
          currentPage: currentPage !== undefined ? currentPage : null,
        },
        include: { book: true },
      });
    });

    res.status(201).json(currentlyReadingBook);
  } catch (error) {
    console.error('Error adding currently reading book:', error);
    res.status(500).json({ error: 'Failed to add currently reading book' });
  }
};

export const updateCurrentlyReadingBook = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { own, willPurchase, startedDate, currentPage } = req.body;

    const record = await prisma.currentlyReadingBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot modify seeded demo books' });
    }

    const updateData: any = {};
    if (own !== undefined) updateData.own = own;
    if (willPurchase !== undefined) updateData.willPurchase = willPurchase;
    if (startedDate !== undefined) updateData.startedDate = startedDate ? new Date(startedDate) : null;
    if (currentPage !== undefined) updateData.currentPage = currentPage;

    const currentlyReadingBook = await prisma.currentlyReadingBook.update({
      where: { id },
      data: updateData,
      include: { book: true },
    });

    res.json(currentlyReadingBook);
  } catch (error) {
    console.error('Error updating currently reading book:', error);
    res.status(500).json({ error: 'Failed to update currently reading book' });
  }
};

export const deleteCurrentlyReadingBook = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const record = await prisma.currentlyReadingBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot delete seeded demo books' });
    }

    await prisma.currentlyReadingBook.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting currently reading book:', error);
    res.status(500).json({ error: 'Failed to delete currently reading book' });
  }
};
