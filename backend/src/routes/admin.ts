import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import {
  getPlatformStats,
  getAllUsers,
  toggleUserActive,
  resetUserPassword,
  getAllInviteCodes,
  adminDeactivateInviteCode,
  getFriendships,
  adminCreateFriendship,
  adminRemoveFriendship,
} from '../controllers/adminController';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementsController';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);
router.post('/users/:id/reset-password', resetUserPassword);
router.get('/invite-codes', getAllInviteCodes);
router.patch('/invite-codes/:id/deactivate', adminDeactivateInviteCode);
router.get('/friendships', getFriendships);
router.post('/friendships', adminCreateFriendship);
router.delete('/friendships/:userId/:friendId', adminRemoveFriendship);

router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

export default router;
