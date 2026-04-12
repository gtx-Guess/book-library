import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

const DEMO_CAP = 10;
const DEMO_CAP_MESSAGE =
  "This is a demo, you've reached the demo book add cap. Please delete some books to try adding them again";

export function demoLimitCheck(listType: 'completed' | 'dnf' | 'wantToRead' | 'currentlyReading') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'demo') {
      return next();
    }

    const userId = req.user.id;
    let count = 0;

    if (listType === 'completed') {
      count = await prisma.completedBook.count({
        where: { userId, isSeeded: false },
      });
    } else if (listType === 'dnf') {
      count = await prisma.dNFBook.count({
        where: { userId, isSeeded: false },
      });
    } else if (listType === 'wantToRead') {
      count = await prisma.wantToReadBook.count({
        where: { userId, isSeeded: false },
      });
    } else if (listType === 'currentlyReading') {
      count = await prisma.currentlyReadingBook.count({
        where: { userId, isSeeded: false },
      });
    }

    if (count >= DEMO_CAP) {
      return res.status(403).json({ error: DEMO_CAP_MESSAGE });
    }

    next();
  };
}
