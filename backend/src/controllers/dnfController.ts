import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllDNFBooks(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const dnfBooks = await prisma.dNFBook.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(dnfBooks);
  } catch (error) {
    console.error('Error fetching DNF books:', error);
    res.status(500).json({ error: 'Failed to fetch DNF books' });
  }
}

export async function addDNFBook(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { googleBooksId, title, authors, description, coverImage, pageCount, publisher, publishedDate, categories, own, willPurchase } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let book = googleBooksId
      ? await prisma.book.findUnique({ where: { googleBooksId } })
      : null;

    if (!book) {
      book = await prisma.book.create({
        data: {
          googleBooksId,
          title,
          authors: authors || [],
          description,
          coverImage,
          pageCount,
          publisher,
          publishedDate,
          categories: categories || [],
        },
      });
    }

    const existingDNFBook = await prisma.dNFBook.findFirst({
      where: { bookId: book.id, userId },
    });

    if (existingDNFBook) {
      return res.status(400).json({ error: 'This book is already in your "DNF list"' });
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

    // Remove from Want to Read list for this user
    await prisma.wantToReadBook.deleteMany({
      where: { bookId: book.id, userId },
    });

    await prisma.currentlyReadingBook.deleteMany({
      where: { bookId: book.id, userId },
    });

    const dnfBook = await prisma.dNFBook.create({
      data: {
        bookId: book.id,
        userId,
        own: own !== undefined ? own : null,
        willPurchase: willPurchase !== undefined ? willPurchase : null,
      },
      include: { book: true },
    });

    res.status(201).json(dnfBook);
  } catch (error) {
    console.error('Error adding DNF book:', error);
    res.status(500).json({ error: 'Failed to add DNF book' });
  }
}

export async function updateDNFBook(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { own, willPurchase } = req.body;

    const record = await prisma.dNFBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot modify seeded demo books' });
    }

    const updateData: any = {};
    if (own !== undefined) updateData.own = own;
    if (willPurchase !== undefined) updateData.willPurchase = willPurchase;

    const dnfBook = await prisma.dNFBook.update({
      where: { id },
      data: updateData,
      include: { book: true },
    });

    res.json(dnfBook);
  } catch (error) {
    console.error('Error updating DNF book:', error);
    res.status(500).json({ error: 'Failed to update DNF book' });
  }
}

export async function deleteDNFBook(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const record = await prisma.dNFBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot delete seeded demo books' });
    }

    await prisma.dNFBook.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting DNF book:', error);
    res.status(500).json({ error: 'Failed to delete DNF book' });
  }
}
