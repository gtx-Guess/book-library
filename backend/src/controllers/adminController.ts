import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function getPlatformStats(req: Request, res: Response) {
  try {
    const [totalUsers, totalBooks, totalDNF, totalWantToRead, totalInviteCodes] = await Promise.all([
      prisma.user.count(),
      prisma.completedBook.count(),
      prisma.dNFBook.count(),
      prisma.wantToReadBook.count(),
      prisma.inviteCode.count(),
    ]);

    // Registrations grouped by month
    const users = await prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const registrationsByMonth: Record<string, number> = {};
    for (const user of users) {
      const key = `${user.createdAt.getFullYear()}-${String(user.createdAt.getMonth() + 1).padStart(2, '0')}`;
      registrationsByMonth[key] = (registrationsByMonth[key] || 0) + 1;
    }

    // Top 10 most active users by completed book count
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        _count: { select: { completedBooks: true } },
      },
      orderBy: { completedBooks: { _count: 'desc' } },
      take: 10,
    });

    res.json({
      totalUsers,
      totalBooks,
      totalDNF,
      totalWantToRead,
      totalInviteCodes,
      registrationsByMonth,
      topUsers: topUsers.map((u) => ({
        id: u.id,
        username: u.username,
        completedBooks: u._count.completedBooks,
      })),
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        invitedBy: {
          select: {
            creator: { select: { username: true } },
          },
        },
        _count: {
          select: {
            completedBooks: true,
            dnfBooks: true,
            wantToReadBooks: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        invitedBy: u.invitedBy?.creator.username ?? null,
        completedBooks: u._count.completedBooks,
        dnfBooks: u._count.dnfBooks,
        wantToReadBooks: u._count.wantToReadBooks,
      }))
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function toggleUserActive(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot deactivate admin account' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, username: true, isActive: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error toggling user active:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
}

export async function resetUserPassword(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

export async function getAllInviteCodes(req: Request, res: Response) {
  try {
    const codes = await prisma.inviteCode.findMany({
      include: {
        creator: { select: { username: true } },
        usedBy: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      codes.map((c) => ({
        id: c.id,
        code: c.code,
        creatorUsername: c.creator.username,
        maxUses: c.maxUses,
        useCount: c.useCount,
        isActive: c.isActive,
        createdAt: c.createdAt,
        usedByUsernames: c.usedBy.map((u) => u.username),
      }))
    );
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    res.status(500).json({ error: 'Failed to fetch invite codes' });
  }
}

export async function adminDeactivateInviteCode(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const invite = await prisma.inviteCode.findUnique({ where: { id } });
    if (!invite) {
      return res.status(404).json({ error: 'Invite code not found' });
    }

    const updated = await prisma.inviteCode.update({
      where: { id },
      data: { isActive: false },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error deactivating invite code:', error);
    res.status(500).json({ error: 'Failed to deactivate invite code' });
  }
}
