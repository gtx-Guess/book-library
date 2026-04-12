import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireNonDemo } from '../middleware/requireNonDemo';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationsController';

const router = Router();

router.get('/', authenticate, requireNonDemo, getNotifications);
router.get('/unread-count', authenticate, requireNonDemo, getUnreadCount);
router.patch('/:id/read', authenticate, requireNonDemo, markAsRead);
router.patch('/read-all', authenticate, requireNonDemo, markAllAsRead);

export default router;
