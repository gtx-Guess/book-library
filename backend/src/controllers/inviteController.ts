import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function generateInviteCode(req: Request, res: Response) {
  try {
    if (req.user!.role === 'demo') {
      return res.status(403).json({ error: 'Demo account cannot generate invite codes' });
    }

    const userId = req.user!.id;
    const maxUses = req.body.maxUses ?? 5;

    if (typeof maxUses !== 'number' || maxUses < 1 || maxUses > 100) {
      return res.status(400).json({ error: 'maxUses must be between 1 and 100' });
    }

    const code = crypto.randomBytes(4).toString('hex'); // 8-char hex

    const invite = await prisma.inviteCode.create({
      data: {
        code,
        creatorId: userId,
        maxUses,
      },
    });

    res.status(201).json(invite);
  } catch (error) {
    console.error('Error generating invite code:', error);
    res.status(500).json({ error: 'Failed to generate invite code' });
  }
}

export async function getMyInviteCodes(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const codes = await prisma.inviteCode.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(codes);
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    res.status(500).json({ error: 'Failed to fetch invite codes' });
  }
}

export async function deactivateInviteCode(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const invite = await prisma.inviteCode.findUnique({ where: { id } });

    if (!invite) {
      return res.status(404).json({ error: 'Invite code not found' });
    }

    if (invite.creatorId !== userId) {
      return res.status(403).json({ error: 'You can only deactivate your own invite codes' });
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
