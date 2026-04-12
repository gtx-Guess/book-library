import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { generateFriendCode } from './profileController';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const RESERVED_USERNAMES = ['admin', 'demo', 'owner'];

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { username, password, inviteCode } = req.body;

    if (!username || !password || !inviteCode) {
      return res.status(400).json({ error: 'Username, password, and invite code are required' });
    }

    if (!USERNAME_REGEX.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-30 characters, alphanumeric and underscores only' });
    }

    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return res.status(400).json({ error: 'That username is reserved' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const invite = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
    if (!invite || !invite.isActive) {
      return res.status(400).json({ error: 'Invalid or inactive invite code' });
    }
    if (invite.useCount >= invite.maxUses) {
      return res.status(400).json({ error: 'Invite code has reached its maximum uses' });
    }
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invite code has expired' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          passwordHash,
          role: 'user',
          invitedById: invite.id,
        },
      });

      await tx.inviteCode.update({
        where: { id: invite.id },
        data: { useCount: { increment: 1 } },
      });

      return newUser;
    });

    // Auto-friend: connect new user with the invite code creator
    try {
      // Create profile for new user with friend code
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          friendCode: generateFriendCode(),
        },
      });

      // Create bidirectional friendship with invite creator
      await prisma.friendship.createMany({
        data: [
          { userId: user.id, friendId: invite.creatorId },
          { userId: invite.creatorId, friendId: user.id },
        ],
        skipDuplicates: true,
      });
    } catch (autoFriendError) {
      // Non-critical: log but don't fail registration
      console.error('Auto-friend setup failed:', autoFriendError);
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.json({ message: 'Logged out' });
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
