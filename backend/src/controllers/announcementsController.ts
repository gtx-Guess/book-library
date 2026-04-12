import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getAnnouncements(req: Request, res: Response) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}

export async function createAnnouncement(req: Request, res: Response) {
  try {
    const { title, message } = req.body;
    const createdBy = req.user!.id;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    const announcement = await prisma.announcement.create({
      data: { title, message, createdBy },
    });
    // Create notifications for all active non-demo users
    const users = await prisma.user.findMany({
      where: { isActive: true, role: { not: 'demo' } },
      select: { id: true },
    });
    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: 'ANNOUNCEMENT',
        title,
        message,
      })),
    });
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
}

export async function deleteAnnouncement(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    await prisma.announcement.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
}
