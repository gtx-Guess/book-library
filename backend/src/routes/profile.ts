import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getFriendCode,
  regenerateFriendCode,
  getFriendProfile,
  getMyFavorites,
  setMyFavorites,
  clearMyFavorites,
} from '../controllers/profileController';
import { authenticate } from '../middleware/authenticate';
import { requireNonDemo } from '../middleware/requireNonDemo';

const router = Router();

router.get('/me', authenticate, requireNonDemo, getMyProfile);
router.patch('/me', authenticate, requireNonDemo, updateMyProfile);
router.get('/friend-code', authenticate, requireNonDemo, getFriendCode);
router.post('/regenerate-friend-code', authenticate, requireNonDemo, regenerateFriendCode);
router.get('/favorites', authenticate, requireNonDemo, getMyFavorites);
router.put('/favorites', authenticate, requireNonDemo, setMyFavorites);
router.delete('/favorites', authenticate, requireNonDemo, clearMyFavorites);
router.get('/:userId', authenticate, requireNonDemo, getFriendProfile);

export default router;
