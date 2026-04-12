import { Request, Response } from 'express';
import { Readable } from 'stream';
import csv from 'csv-parser';
import prisma from '../lib/prisma';
import { searchBooks } from '../services/googleBooks';
import { randomUUID } from 'crypto';

interface SyncJob {
  userId: string;
  status: 'running' | 'completed' | 'failed';
  total: number;
  processed: number;
  createdAt: number;
}

const syncJobs = new Map<string, SyncJob>();
const SYNC_JOB_TTL_MS = 30 * 60 * 1000; // 30 minutes

function cleanupSyncJobs() {
  const now = Date.now();
  for (const [id, job] of syncJobs) {
    if (now - job.createdAt > SYNC_JOB_TTL_MS) {
      syncJobs.delete(id);
    }
  }
}

const KNOWN_SHELVES = new Set(['read', 'did-not-finish', 'currently-reading', 'to-read']);

function parseGoodReadsDate(raw: string): Date | null {
  if (!raw || !raw.trim()) return null;
  // Format: YYYY/MM/DD
  const parts = raw.trim().split('/');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

interface ImportRow {
  Title: string;
  Author: string;
  'Additional Authors': string;
  'My Rating': string;
  Publisher: string;
  'Number of Pages': string;
  'Year Published': string;
  'Date Read': string;
  'Date Added': string;
  Bookshelves: string;
  'Exclusive Shelf': string;
}

export async function importGoodReads(req: Request, res: Response) {
  try {
    if (req.user!.role === 'demo') {
      return res.status(403).json({ error: 'Import is not available for demo accounts' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user!.id;
    const buffer = req.file.buffer;

    // Parse CSV from buffer
    const rows: ImportRow[] = await new Promise((resolve, reject) => {
      const results: ImportRow[] = [];
      const stream = Readable.from(buffer);
      stream
        .pipe(csv())
        .on('data', (row: ImportRow) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    const summary = {
      imported: { completed: 0, currentlyReading: 0, wantToRead: 0, dnf: 0 },
      skipped: { duplicates: 0 },
      customShelves: [] as { name: string; count: number }[],
      importedBookIds: [] as string[],
    };

    const customShelfCounts = new Map<string, number>();

    for (const row of rows) {
      const exclusiveShelf = (row['Exclusive Shelf'] || '').trim();

      // Collect custom shelves from Bookshelves column
      const bookshelves = (row['Bookshelves'] || '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !KNOWN_SHELVES.has(s));

      for (const shelf of bookshelves) {
        customShelfCounts.set(shelf, (customShelfCounts.get(shelf) || 0) + 1);
      }

      if (!KNOWN_SHELVES.has(exclusiveShelf)) {
        // Not importable — track custom shelf
        if (exclusiveShelf) {
          customShelfCounts.set(
            exclusiveShelf,
            (customShelfCounts.get(exclusiveShelf) || 0) + 1,
          );
        }
        continue;
      }

      const title = (row['Title'] || '').trim();
      const author = (row['Author'] || '').trim();

      if (!title) continue;

      const authors = [author];
      if (row['Additional Authors']) {
        const additional = row['Additional Authors']
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0);
        authors.push(...additional);
      }

      const pageCount = parseInt(row['Number of Pages'], 10) || null;
      const publisher = (row['Publisher'] || '').trim() || null;
      const publishedDate = (row['Year Published'] || '').trim() || null;
      const ratingRaw = parseInt(row['My Rating'], 10);
      // GoodReads uses 1-5 scale; convert to app's 1-10 scale
      const rating = ratingRaw > 0 ? ratingRaw * 2 : null;

      // Upsert Book — find by case-insensitive title + exact author list match
      let book = await prisma.book.findFirst({
        where: {
          title: { equals: title, mode: 'insensitive' },
          authors: { equals: authors },
        },
      });

      if (!book) {
        book = await prisma.book.create({
          data: {
            title,
            authors,
            pageCount: pageCount ?? undefined,
            publisher: publisher ?? undefined,
            publishedDate: publishedDate ?? undefined,
            categories: [],
          },
        });
      }

      const bookId = book.id;

      if (exclusiveShelf === 'read') {
        // Check for duplicate
        const existing = await prisma.completedBook.findFirst({
          where: { userId, bookId },
        });
        if (existing) {
          summary.skipped.duplicates++;
          continue;
        }

        const dateRead = parseGoodReadsDate(row['Date Read']);
        const dateAdded = parseGoodReadsDate(row['Date Added']);
        const completedDate = dateRead || dateAdded || new Date();
        const year = completedDate.getUTCFullYear();

        // Remove from other lists before adding to completed
        await prisma.dNFBook.deleteMany({ where: { bookId, userId } });
        await prisma.wantToReadBook.deleteMany({ where: { bookId, userId } });
        await prisma.currentlyReadingBook.deleteMany({ where: { bookId, userId } });

        await prisma.completedBook.create({
          data: {
            bookId,
            userId,
            completedDate,
            year,
            rating: rating ?? undefined,
          },
        });

        summary.imported.completed++;
        summary.importedBookIds.push(bookId);
      } else if (exclusiveShelf === 'did-not-finish') {
        const existing = await prisma.dNFBook.findFirst({
          where: { userId, bookId },
        });
        if (existing) {
          summary.skipped.duplicates++;
          continue;
        }

        // Skip if already completed (completed takes priority)
        const existingCompleted = await prisma.completedBook.findFirst({
          where: { userId, bookId },
        });
        if (existingCompleted) {
          summary.skipped.duplicates++;
          continue;
        }

        // Remove from other lists
        await prisma.wantToReadBook.deleteMany({ where: { bookId, userId } });
        await prisma.currentlyReadingBook.deleteMany({ where: { bookId, userId } });

        await prisma.dNFBook.create({
          data: { bookId, userId },
        });

        summary.imported.dnf++;
        summary.importedBookIds.push(bookId);
      } else if (exclusiveShelf === 'to-read') {
        const existing = await prisma.wantToReadBook.findFirst({
          where: { userId, bookId },
        });
        if (existing) {
          summary.skipped.duplicates++;
          continue;
        }

        // Skip if already on a higher-priority list
        const existingCompleted = await prisma.completedBook.findFirst({ where: { userId, bookId } });
        const existingDnf = await prisma.dNFBook.findFirst({ where: { userId, bookId } });
        const existingCr = await prisma.currentlyReadingBook.findFirst({ where: { userId, bookId } });
        if (existingCompleted || existingDnf || existingCr) {
          summary.skipped.duplicates++;
          continue;
        }

        await prisma.wantToReadBook.create({
          data: { bookId, userId },
        });

        summary.imported.wantToRead++;
        summary.importedBookIds.push(bookId);
      } else if (exclusiveShelf === 'currently-reading') {
        const existing = await prisma.currentlyReadingBook.findFirst({
          where: { userId, bookId },
        });
        if (existing) {
          summary.skipped.duplicates++;
          continue;
        }

        // Skip if already completed (completed takes priority)
        const existingCompleted = await prisma.completedBook.findFirst({ where: { userId, bookId } });
        if (existingCompleted) {
          summary.skipped.duplicates++;
          continue;
        }

        // Remove from want-to-read (currently-reading supersedes it)
        await prisma.wantToReadBook.deleteMany({ where: { bookId, userId } });

        await prisma.currentlyReadingBook.create({
          data: { bookId, userId },
        });

        summary.imported.currentlyReading++;
        summary.importedBookIds.push(bookId);
      }
    }

    // Build custom shelves array
    summary.customShelves = Array.from(customShelfCounts.entries()).map(
      ([name, count]) => ({ name, count }),
    );

    return res.json(summary);
  } catch (error) {
    console.error('GoodReads import error:', error);
    return res.status(500).json({ error: 'Import failed' });
  }
}

export async function startSync(req: Request, res: Response) {
  try {
    if (req.user!.role === 'demo') {
      return res.status(403).json({ error: 'Sync is not available for demo accounts' });
    }

    const userId = req.user!.id;
    const { bookIds } = req.body as { bookIds: string[] };

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ error: 'bookIds array is required' });
    }

    const syncId = randomUUID();
    cleanupSyncJobs();
    const job: SyncJob = {
      userId,
      status: 'running',
      total: bookIds.length,
      processed: 0,
      createdAt: Date.now(),
    };

    syncJobs.set(syncId, job);

    // Kick off background enrichment — do not await
    enrichBooks(syncId, bookIds).catch((err) => {
      console.error('enrichBooks error:', err);
      const j = syncJobs.get(syncId);
      if (j) j.status = 'failed';
    });

    return res.status(202).json({ syncId });
  } catch (error) {
    console.error('startSync error:', error);
    return res.status(500).json({ error: 'Failed to start sync' });
  }
}

export async function syncAll(req: Request, res: Response) {
  try {
    if (req.user!.role === 'demo') {
      return res.status(403).json({ error: 'Sync is not available for demo accounts' });
    }

    const userId = req.user!.id;

    // Find all book IDs across all lists that lack a cover image
    const [completed, dnf, wantToRead, currentlyReading] = await Promise.all([
      prisma.completedBook.findMany({ where: { userId }, select: { bookId: true } }),
      prisma.dNFBook.findMany({ where: { userId }, select: { bookId: true } }),
      prisma.wantToReadBook.findMany({ where: { userId }, select: { bookId: true } }),
      prisma.currentlyReadingBook.findMany({ where: { userId }, select: { bookId: true } }),
    ]);

    const allBookIds = [
      ...new Set([
        ...completed.map((b) => b.bookId),
        ...dnf.map((b) => b.bookId),
        ...wantToRead.map((b) => b.bookId),
        ...currentlyReading.map((b) => b.bookId),
      ]),
    ];

    // Filter to books that are missing a cover image
    const booksNeedingSync = await prisma.book.findMany({
      where: { id: { in: allBookIds }, coverImage: null },
      select: { id: true },
    });

    const bookIds = booksNeedingSync.map((b) => b.id);

    if (bookIds.length === 0) {
      return res.json({ syncId: null, message: 'All books already have metadata', total: 0 });
    }

    cleanupSyncJobs();
    const syncId = randomUUID();
    const job: SyncJob = {
      userId,
      status: 'running',
      total: bookIds.length,
      processed: 0,
      createdAt: Date.now(),
    };

    syncJobs.set(syncId, job);

    enrichBooks(syncId, bookIds).catch((err) => {
      console.error('enrichBooks error:', err);
      const j = syncJobs.get(syncId);
      if (j) j.status = 'failed';
    });

    return res.status(202).json({ syncId, total: bookIds.length });
  } catch (error) {
    console.error('syncAll error:', error);
    return res.status(500).json({ error: 'Failed to start sync' });
  }
}

export async function getSyncStatus(req: Request, res: Response) {
  const { syncId } = req.params;
  const job = syncJobs.get(syncId);

  if (!job || job.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Sync job not found' });
  }

  return res.json({
    status: job.status,
    total: job.total,
    processed: job.processed,
  });
}

async function enrichBooks(syncId: string, bookIds: string[]): Promise<void> {
  const job = syncJobs.get(syncId)!;

  for (const bookId of bookIds) {
    try {
      const book = await prisma.book.findUnique({ where: { id: bookId } });

      if (!book) {
        job.processed++;
        continue;
      }

      // Skip if already has cover image
      if (book.coverImage) {
        job.processed++;
        continue;
      }

      const query = `${book.title} ${book.authors[0] || ''}`.trim();
      const results = await searchBooks(query);

      if (results && results.length > 0) {
        const first = results[0];
        const { description, categories, imageLinks } = first.volumeInfo;
        const coverImage = imageLinks?.thumbnail ?? imageLinks?.smallThumbnail;

        // Only set googleBooksId if the book doesn't already have one
        // and the target ID isn't already used by another book
        let googleBooksId: string | undefined = undefined;
        if (!book.googleBooksId && first.id) {
          const existing = await prisma.book.findUnique({ where: { googleBooksId: first.id } });
          if (!existing) {
            googleBooksId = first.id;
          }
        }

        await prisma.book.update({
          where: { id: bookId },
          data: {
            coverImage: coverImage ?? undefined,
            description: book.description || description || undefined,
            categories: book.categories.length > 0 ? undefined : (categories ?? undefined),
            ...(googleBooksId ? { googleBooksId } : {}),
          },
        });
      }
    } catch (err) {
      console.error(`enrichBooks: error processing bookId ${bookId}:`, err);
    }

    job.processed++;

    // 500ms delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  job.status = 'completed';
}
