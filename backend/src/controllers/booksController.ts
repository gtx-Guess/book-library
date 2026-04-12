import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { searchBooks, getBookById } from '../services/googleBooks';

export async function searchBooksFromAPI(req: Request, res: Response) {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const books = await searchBooks(query);
    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
}

export async function addCompletedBook(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { googleBooksId, title, authors, description, coverImage, pageCount, publisher, publishedDate, categories, completedDate, rating, own, willPurchase, link } = req.body;

    if (!title || !completedDate) {
      return res.status(400).json({ error: 'Title and completed date are required' });
    }

    const completedDateObj = new Date(completedDate);
    const year = completedDateObj.getUTCFullYear();

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

    // Check for duplicate in completed list
    const existingCompleted = await prisma.completedBook.findFirst({
      where: { bookId: book.id, userId },
    });

    if (existingCompleted) {
      return res.status(400).json({
        error: 'This book is already in your completed list',
        year: existingCompleted.year,
      });
    }

    const completedBook = await prisma.$transaction(async (tx) => {
      const created = await tx.completedBook.create({
        data: {
          bookId: book.id,
          userId,
          completedDate: completedDateObj,
          year,
          pageCount: pageCount || null,
          rating: rating != null ? rating : null,
          own: own !== undefined ? own : null,
          willPurchase: willPurchase !== undefined ? willPurchase : null,
          link: link || null,
        },
        include: {
          book: true,
        },
      });

      // Remove from other lists atomically
      await tx.dNFBook.deleteMany({ where: { bookId: book.id, userId } });
      await tx.wantToReadBook.deleteMany({ where: { bookId: book.id, userId } });
      await tx.currentlyReadingBook.deleteMany({ where: { bookId: book.id, userId } });

      return created;
    });

    res.status(201).json(completedBook);
  } catch (error) {
    console.error('Error adding completed book:', error);
    res.status(500).json({ error: 'Failed to add completed book' });
  }
}

export async function getCompletedBooksByYear(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { year } = req.params;
    const yearNum = parseInt(year, 10);

    if (isNaN(yearNum)) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const completedBooks = await prisma.completedBook.findMany({
      where: { year: yearNum, userId },
      include: { book: true },
      orderBy: { completedDate: 'desc' },
    });

    res.json(completedBooks);
  } catch (error) {
    console.error('Error fetching completed books:', error);
    res.status(500).json({ error: 'Failed to fetch completed books' });
  }
}

export async function updateCompletedBook(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { link, own, willPurchase, rating, completedDate, pageCount } = req.body;

    const record = await prisma.completedBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot modify seeded demo books' });
    }

    const updateData: any = {};
    if (link !== undefined) updateData.link = link || null;
    if (own !== undefined) updateData.own = own;
    if (willPurchase !== undefined) updateData.willPurchase = willPurchase;
    if (rating !== undefined) updateData.rating = rating;
    if (completedDate !== undefined) {
      const parsed = new Date(completedDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'Invalid completedDate' });
      }
      updateData.completedDate = parsed;
      updateData.year = parsed.getUTCFullYear();
    }
    if (pageCount !== undefined) {
      if (pageCount !== null && (typeof pageCount !== 'number' || !Number.isInteger(pageCount) || pageCount < 1)) {
        return res.status(400).json({ error: 'Invalid pageCount' });
      }
      updateData.pageCount = pageCount;
    }

    const completedBook = await prisma.completedBook.update({
      where: { id },
      data: updateData,
      include: { book: true },
    });

    res.json(completedBook);
  } catch (error) {
    console.error('Error updating completed book:', error);
    res.status(500).json({ error: 'Failed to update completed book' });
  }
}

export async function deleteCompletedBook(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const record = await prisma.completedBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot delete seeded demo books' });
    }

    await prisma.completedBook.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting completed book:', error);
    res.status(500).json({ error: 'Failed to delete completed book' });
  }
}

export async function getAllCompletedBooks(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [completedBooks, totalCount] = await Promise.all([
      prisma.completedBook.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { completedDate: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.completedBook.count({ where: { userId } }),
    ]);

    res.json({
      books: completedBooks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching all completed books:', error);
    res.status(500).json({ error: 'Failed to fetch all completed books' });
  }
}
