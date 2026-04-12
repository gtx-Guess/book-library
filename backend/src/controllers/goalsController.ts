import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getGoalByYear(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { year } = req.params;
    const yearNum = parseInt(year, 10);

    if (isNaN(yearNum)) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const goal = await prisma.yearlyGoal.findUnique({
      where: { userId_year: { userId, year: yearNum } },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found for this year' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
}

export async function setGoalForYear(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { year } = req.params;
    const { goalCount } = req.body;
    const yearNum = parseInt(year, 10);

    if (isNaN(yearNum) || !goalCount || goalCount < 1) {
      return res.status(400).json({ error: 'Valid year and goal count are required' });
    }

    const goal = await prisma.yearlyGoal.upsert({
      where: { userId_year: { userId, year: yearNum } },
      update: { goalCount },
      create: { userId, year: yearNum, goalCount },
    });

    res.json(goal);
  } catch (error) {
    console.error('Error setting goal:', error);
    res.status(500).json({ error: 'Failed to set goal' });
  }
}
