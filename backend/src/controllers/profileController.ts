import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export function generateFriendCode(): string {
  return crypto.randomBytes(4).toString('hex');
}

export async function ensureProfile(userId: string) {
  let profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        userId,
        friendCode: generateFriendCode(),
      },
    });
  }

  return profile;
}

export async function getMyProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const profile = await ensureProfile(userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true },
    });

    res.json({
      ...profile,
      displayName: user?.displayName,
      username: user?.username,
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
}

export async function updateMyProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { displayName, bio, shareLibrary } = req.body;

    await ensureProfile(userId);

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(shareLibrary !== undefined && { shareLibrary }),
      },
    });

    if (displayName !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { displayName },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true },
    });

    res.json({
      ...updatedProfile,
      displayName: user?.displayName,
      username: user?.username,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function getFriendCode(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const profile = await ensureProfile(userId);

    res.json({ friendCode: profile.friendCode });
  } catch (error) {
    console.error('Error getting friend code:', error);
    res.status(500).json({ error: 'Failed to get friend code' });
  }
}

export async function regenerateFriendCode(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    await ensureProfile(userId);

    const newCode = generateFriendCode();
    await prisma.userProfile.update({
      where: { userId },
      data: { friendCode: newCode },
    });

    res.json({ friendCode: newCode });
  } catch (error) {
    console.error('Error regenerating friend code:', error);
    res.status(500).json({ error: 'Failed to regenerate friend code' });
  }
}

export async function getFriendProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const friendId = req.params.userId;

    const friendship = await prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId,
          friendId,
        },
      },
    });

    if (!friendship) {
      return res.status(403).json({ error: 'You are not friends with this user' });
    }

    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
    });

    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friendProfile = await prisma.userProfile.findUnique({
      where: { userId: friendId },
    });

    res.json({
      id: friend.id,
      username: friend.username,
      displayName: friend.displayName,
      bio: friendProfile?.bio || null,
      avatarUrl: friendProfile?.avatarUrl || null,
      shareLibrary: friendProfile?.shareLibrary ?? true,
    });
  } catch (error) {
    console.error('Error getting friend profile:', error);
    res.status(500).json({ error: 'Failed to get friend profile' });
  }
}

export async function getMyFavorites(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const manualFavorites = await prisma.favoriteBook.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: { book: true },
    });

    if (manualFavorites.length > 0) {
      return res.json({
        source: 'manual',
        books: manualFavorites.map((f) => f.book),
      });
    }

    const topBooks = await prisma.completedBook.findMany({
      where: { userId },
      orderBy: { rating: 'desc' },
      take: 5,
      include: { book: true },
    });

    res.json({
      source: 'auto',
      books: topBooks.map((cb) => cb.book),
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
}

export async function setMyFavorites(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { bookIds } = req.body;

    if (!Array.isArray(bookIds)) {
      return res.status(400).json({ error: 'bookIds must be an array' });
    }

    if (bookIds.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 favorite books allowed' });
    }

    const completedBooks = await prisma.completedBook.findMany({
      where: {
        userId,
        bookId: { in: bookIds },
      },
      select: { bookId: true },
    });

    const completedBookIds = new Set(completedBooks.map((cb) => cb.bookId));
    const invalidIds = bookIds.filter((id: string) => !completedBookIds.has(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({ error: 'Some books are not in your completed list' });
    }

    const favorites = await prisma.$transaction(async (tx) => {
      await tx.favoriteBook.deleteMany({ where: { userId } });

      const created = await Promise.all(
        bookIds.map((bookId: string, index: number) =>
          tx.favoriteBook.create({
            data: {
              userId,
              bookId,
              order: index,
            },
            include: { book: true },
          })
        )
      );

      return created;
    });

    res.json({
      source: 'manual',
      books: favorites.map((f) => f.book),
    });
  } catch (error) {
    console.error('Error setting favorites:', error);
    res.status(500).json({ error: 'Failed to set favorites' });
  }
}

export async function clearMyFavorites(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    await prisma.favoriteBook.deleteMany({ where: { userId } });

    res.status(204).send();
  } catch (error) {
    console.error('Error clearing favorites:', error);
    res.status(500).json({ error: 'Failed to clear favorites' });
  }
}
