import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// ─── Helper Functions ───────────────────────────────────────────────

async function verifyFriendship(userId: string, friendId: string): Promise<boolean> {
  const friendship = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId, friendId } },
  });
  return !!friendship;
}

async function checkShareLibrary(friendId: string): Promise<boolean> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: friendId },
  });
  return profile ? profile.shareLibrary : true;
}

// ─── Friend Management ─────────────────────────────────────────────

export async function getFriends(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const friendships = await prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    const friends = await Promise.all(
      friendships.map(async (f) => {
        const profile = await prisma.userProfile.findUnique({
          where: { userId: f.friendId },
        });

        const lastCompleted = await prisma.completedBook.findFirst({
          where: { userId: f.friendId },
          include: { book: true },
          orderBy: { completedDate: 'desc' },
        });

        const shareLibrary = profile?.shareLibrary ?? true;

        return {
          id: f.friend.id,
          username: f.friend.username,
          displayName: f.friend.displayName,
          avatarUrl: profile?.avatarUrl || null,
          shareLibrary,
          lastBook: shareLibrary && lastCompleted
            ? {
                title: lastCompleted.book.title,
                coverImage: lastCompleted.book.coverImage,
                completedDate: lastCompleted.completedDate,
                rating: lastCompleted.rating || null,
              }
            : null,
          friendSince: f.createdAt,
        };
      })
    );

    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
}

export async function sendFriendRequest(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { friendCode } = req.body;

    const profile = await prisma.userProfile.findUnique({
      where: { friendCode },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Friend code not found' });
    }

    if (profile.userId === userId) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findUnique({
      where: { userId_friendId: { userId, friendId: profile.userId } },
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'You are already friends with this user' });
    }

    // Check for pending request in either direction
    const pendingRequest = await prisma.friendRequest.findFirst({
      where: {
        status: 'PENDING',
        OR: [
          { senderId: userId, receiverId: profile.userId },
          { senderId: profile.userId, receiverId: userId },
        ],
      },
    });

    if (pendingRequest) {
      return res.status(400).json({ error: 'A pending friend request already exists' });
    }

    // Delete any previous DECLINED request from this sender
    await prisma.friendRequest.deleteMany({
      where: {
        senderId: userId,
        receiverId: profile.userId,
        status: 'DECLINED',
      },
    });

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: profile.userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    // Create notification for the receiver
    try {
      const senderDisplayName = friendRequest.sender.displayName || friendRequest.sender.username;
      await prisma.notification.create({
        data: {
          userId: profile.userId,
          type: 'FRIEND_REQUEST',
          title: 'Friend Request',
          message: `${senderDisplayName} sent you a friend request`,
          link: '/social',
          relatedUserId: userId,
        },
      });
    } catch (err) {
      console.error('Failed to create friend request notification:', err);
    }

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
}

export async function getPendingRequests(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
}

export async function acceptFriendRequest(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const request = await prisma.friendRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (request.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'This request is no longer pending' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.friendRequest.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });

      await tx.friendship.createMany({
        data: [
          { userId: request.senderId, friendId: request.receiverId },
          { userId: request.receiverId, friendId: request.senderId },
        ],
        skipDuplicates: true,
      });
    });

    // Create notification for the original sender
    try {
      const acceptor = await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true, username: true },
      });
      const acceptorDisplayName = acceptor?.displayName || acceptor?.username || 'Someone';
      await prisma.notification.create({
        data: {
          userId: request.senderId,
          type: 'FRIEND_ACCEPTED',
          title: 'Friend Request Accepted',
          message: `${acceptorDisplayName} accepted your friend request`,
          link: '/social',
          relatedUserId: userId,
        },
      });
    } catch (err) {
      console.error('Failed to create friend accepted notification:', err);
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
}

export async function declineFriendRequest(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const request = await prisma.friendRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (request.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized to decline this request' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'This request is no longer pending' });
    }

    await prisma.friendRequest.update({
      where: { id },
      data: { status: 'DECLINED' },
    });

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({ error: 'Failed to decline friend request' });
  }
}

export async function removeFriend(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { friendId } = req.params;

    await prisma.$transaction(async (tx) => {
      await tx.friendship.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      // Clean up accepted friend requests so re-friending works
      await tx.friendRequest.deleteMany({
        where: {
          status: 'ACCEPTED',
          OR: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },
          ],
        },
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
}

// ─── Friend Library Viewing ─────────────────────────────────────────

export async function getFriendCompleted(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { friendId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const isFriend = await verifyFriendship(userId, friendId);
    if (!isFriend) {
      return res.status(403).json({ error: 'You are not friends with this user' });
    }

    const shareLibrary = await checkShareLibrary(friendId);
    if (!shareLibrary) {
      return res.status(403).json({ error: 'This user has disabled library sharing' });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [completedBooks, totalCount] = await Promise.all([
      prisma.completedBook.findMany({
        where: { userId: friendId },
        include: { book: true },
        orderBy: { completedDate: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.completedBook.count({ where: { userId: friendId } }),
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
    console.error('Error fetching friend completed books:', error);
    res.status(500).json({ error: 'Failed to fetch friend completed books' });
  }
}

export async function getFriendCurrentlyReading(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { friendId } = req.params;

    const isFriend = await verifyFriendship(userId, friendId);
    if (!isFriend) {
      return res.status(403).json({ error: 'You are not friends with this user' });
    }

    const shareLibrary = await checkShareLibrary(friendId);
    if (!shareLibrary) {
      return res.status(403).json({ error: 'This user has disabled library sharing' });
    }

    const books = await prisma.currentlyReadingBook.findMany({
      where: { userId: friendId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(books);
  } catch (error) {
    console.error('Error fetching friend currently reading:', error);
    res.status(500).json({ error: 'Failed to fetch friend currently reading books' });
  }
}

export async function getFriendDNF(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { friendId } = req.params;

    const isFriend = await verifyFriendship(userId, friendId);
    if (!isFriend) {
      return res.status(403).json({ error: 'You are not friends with this user' });
    }

    const shareLibrary = await checkShareLibrary(friendId);
    if (!shareLibrary) {
      return res.status(403).json({ error: 'This user has disabled library sharing' });
    }

    const books = await prisma.dNFBook.findMany({
      where: { userId: friendId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(books);
  } catch (error) {
    console.error('Error fetching friend DNF books:', error);
    res.status(500).json({ error: 'Failed to fetch friend DNF books' });
  }
}

export async function getFriendWantToRead(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { friendId } = req.params;

    const isFriend = await verifyFriendship(userId, friendId);
    if (!isFriend) {
      return res.status(403).json({ error: 'You are not friends with this user' });
    }

    const shareLibrary = await checkShareLibrary(friendId);
    if (!shareLibrary) {
      return res.status(403).json({ error: 'This user has disabled library sharing' });
    }

    const books = await prisma.wantToReadBook.findMany({
      where: { userId: friendId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(books);
  } catch (error) {
    console.error('Error fetching friend want to read books:', error);
    res.status(500).json({ error: 'Failed to fetch friend want to read books' });
  }
}

export async function getFriendStats(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { friendId } = req.params;

    const isFriend = await verifyFriendship(userId, friendId);
    if (!isFriend) {
      return res.status(403).json({ error: 'You are not friends with this user' });
    }

    const currentYear = new Date().getFullYear();

    const [goal, lastBook, booksThisYear, shareLibrary] = await Promise.all([
      prisma.yearlyGoal.findUnique({
        where: { userId_year: { userId: friendId, year: currentYear } },
      }),
      prisma.completedBook.findFirst({
        where: { userId: friendId },
        include: { book: true },
        orderBy: { completedDate: 'desc' },
      }),
      prisma.completedBook.count({
        where: { userId: friendId, year: currentYear },
      }),
      checkShareLibrary(friendId),
    ]);

    const goalData = goal
      ? {
          goalCount: goal.goalCount,
          booksRead: booksThisYear,
          progress: goal.goalCount > 0 ? Math.round((booksThisYear / goal.goalCount) * 100) : 0,
        }
      : null;

    if (!shareLibrary) {
      return res.json({
        shareLibrary: false,
        goal: goalData,
        lastBook: lastBook
          ? {
              title: lastBook.book.title,
              coverImage: lastBook.book.coverImage,
              completedDate: lastBook.completedDate,
              rating: lastBook.rating || null,
            }
          : null,
      });
    }

    const [totalBooks, pagesAggregate] = await Promise.all([
      prisma.completedBook.count({ where: { userId: friendId } }),
      prisma.completedBook.aggregate({
        where: { userId: friendId, year: currentYear },
        _sum: { pageCount: true },
      }),
    ]);

    res.json({
      shareLibrary: true,
      goal: goalData,
      lastBook: lastBook
        ? {
            title: lastBook.book.title,
            coverImage: lastBook.book.coverImage,
            completedDate: lastBook.completedDate,
            rating: lastBook.rating || null,
          }
        : null,
      booksThisYear,
      totalBooks,
      pagesThisYear: pagesAggregate._sum.pageCount || 0,
    });
  } catch (error) {
    console.error('Error fetching friend stats:', error);
    res.status(500).json({ error: 'Failed to fetch friend stats' });
  }
}

export async function getFriendFavorites(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { friendId } = req.params;

    const isFriend = await verifyFriendship(userId, friendId);
    if (!isFriend) {
      return res.status(403).json({ error: 'You are not friends with this user' });
    }

    const shareLibrary = await checkShareLibrary(friendId);
    if (!shareLibrary) {
      return res.status(403).json({ error: 'This user has disabled library sharing' });
    }

    // Check for manual FavoriteBook entries first
    const manualFavorites = await prisma.favoriteBook.findMany({
      where: { userId: friendId },
      include: { book: true },
      orderBy: { order: 'asc' },
    });

    if (manualFavorites.length > 0) {
      return res.json({ source: 'manual', books: manualFavorites.map((f) => f.book) });
    }

    // Fall back to top 5 by rating
    const topRated = await prisma.completedBook.findMany({
      where: { userId: friendId, rating: { not: null } },
      include: { book: true },
      orderBy: { rating: 'desc' },
      take: 5,
    });

    res.json({ source: 'auto', books: topRated.map((cb) => cb.book) });
  } catch (error) {
    console.error('Error fetching friend favorites:', error);
    res.status(500).json({ error: 'Failed to fetch friend favorites' });
  }
}
