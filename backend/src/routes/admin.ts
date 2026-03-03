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
} from '../controllers/adminController';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);
router.post('/users/:id/reset-password', resetUserPassword);
router.get('/invite-codes', getAllInviteCodes);
router.patch('/invite-codes/:id/deactivate', adminDeactivateInviteCode);

export default router;
