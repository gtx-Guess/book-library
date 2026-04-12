import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getYearlyStats(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { year } = req.params;
    const yearNum = parseInt(year, 10);

    if (isNaN(yearNum)) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const [completedBooks, goal, lastBook] = await Promise.all([
      prisma.completedBook.findMany({
        where: { year: yearNum, userId },
        include: { book: true },
      }),
      prisma.yearlyGoal.findUnique({
        where: { userId_year: { userId, year: yearNum } },
      }),
      prisma.completedBook.findFirst({
        where: { year: yearNum, userId },
        include: { book: true },
        orderBy: { completedDate: 'desc' },
      }),
    ]);

    const booksRead = completedBooks.length;
    const goalCount = goal?.goalCount || 0;
    const progress = goalCount > 0 ? Math.round((booksRead / goalCount) * 100) : 0;

    const totalPagesRead = completedBooks.reduce((sum, cb) => {
      return sum + (cb.pageCount || cb.book.pageCount || 0);
    }, 0);

    res.json({
      year: yearNum,
      booksRead,
      goalCount,
      progress,
      hasGoal: !!goal,
      totalPagesRead,
      lastBook: lastBook ? {
        id: lastBook.id,
        title: lastBook.book.title,
        authors: lastBook.book.authors,
        coverImage: lastBook.book.coverImage,
        completedDate: lastBook.completedDate,
        pageCount: lastBook.pageCount || lastBook.book.pageCount,
        rating: lastBook.rating,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function getAllYears(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const completedBooks = await prisma.completedBook.findMany({
      where: { userId },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });

    const years = completedBooks.map(cb => cb.year);
    res.json(years);
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({ error: 'Failed to fetch years' });
  }
}

export async function getAllYearsWithStats(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const yearsData = await prisma.completedBook.findMany({
      where: { userId },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });

    const years = yearsData.map(y => y.year);

    const yearStats = await Promise.all(
      years.map(async (year) => {
        const [completedBooks, goal] = await Promise.all([
          prisma.completedBook.findMany({
            where: { year, userId },
            include: { book: true },
          }),
          prisma.yearlyGoal.findUnique({
            where: { userId_year: { userId, year } },
          }),
        ]);

        const booksRead = completedBooks.length;
        const goalCount = goal?.goalCount || 0;
        const progress = goalCount > 0 ? Math.round((booksRead / goalCount) * 100) : 0;
        const totalPagesRead = completedBooks.reduce((sum, cb) => {
          return sum + (cb.pageCount || cb.book.pageCount || 0);
        }, 0);

        return {
          year,
          booksRead,
          goalCount,
          progress,
          hasGoal: !!goal,
          totalPagesRead,
          goalAchieved: goalCount > 0 && booksRead >= goalCount,
        };
      })
    );

    const allBooks = await prisma.completedBook.findMany({
      where: { userId },
      include: { book: true },
    });

    const allTimeStats = {
      totalBooks: allBooks.length,
      totalPages: allBooks.reduce((sum, cb) => {
        return sum + (cb.pageCount || cb.book.pageCount || 0);
      }, 0),
      yearsTracked: years.length,
      avgBooksPerYear: years.length > 0 ? Math.round(allBooks.length / years.length) : 0,
    };

    res.json({ years: yearStats, allTime: allTimeStats });
  } catch (error) {
    console.error('Error fetching all years stats:', error);
    res.status(500).json({ error: 'Failed to fetch all years stats' });
  }
}
