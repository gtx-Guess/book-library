import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllWantToReadBooks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const books = await prisma.wantToReadBook.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(books);
  } catch (error) {
    console.error('Error fetching want to read books:', error);
    res.status(500).json({ error: 'Failed to fetch want to read books' });
  }
};

export const addWantToReadBook = async (req: Request, res: Response) => {
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

    const existingWantToReadBook = await prisma.wantToReadBook.findFirst({
      where: { bookId: book.id, userId },
    });

    if (existingWantToReadBook) {
      return res.status(400).json({ error: 'This book is already in your "Want to read list"' });
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

    const existingCurrentlyReading = await prisma.currentlyReadingBook.findFirst({
      where: { bookId: book.id, userId },
    });

    if (existingCurrentlyReading) {
      return res.status(400).json({ error: 'This book is already in your "Currently Reading" list' });
    }

    const wantToReadBook = await prisma.wantToReadBook.create({
      data: { bookId: book.id, userId, own, willPurchase },
      include: { book: true },
    });

    res.status(201).json(wantToReadBook);
  } catch (error) {
    console.error('Error adding want to read book:', error);
    res.status(500).json({ error: 'Failed to add want to read book' });
  }
};

export const updateWantToReadBook = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { own, willPurchase } = req.body;

    const record = await prisma.wantToReadBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot modify seeded demo books' });
    }

    const wantToReadBook = await prisma.wantToReadBook.update({
      where: { id },
      data: { own, willPurchase },
      include: { book: true },
    });

    res.json(wantToReadBook);
  } catch (error) {
    console.error('Error updating want to read book:', error);
    res.status(500).json({ error: 'Failed to update want to read book' });
  }
};

export const deleteWantToReadBook = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const record = await prisma.wantToReadBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot delete seeded demo books' });
    }

    await prisma.wantToReadBook.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting want to read book:', error);
    res.status(500).json({ error: 'Failed to delete want to read book' });
  }
};
