import { Request, Response, NextFunction } from 'express';

export function requireNonDemo(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'demo') {
    return res.status(403).json({ error: 'Social features are not available in demo mode' });
  }
  next();
}
