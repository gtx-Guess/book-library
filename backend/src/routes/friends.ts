import { Router } from 'express';
import {
  getFriends,
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriendCompleted,
  getFriendCurrentlyReading,
  getFriendDNF,
  getFriendWantToRead,
  getFriendStats,
  getFriendFavorites,
} from '../controllers/friendsController';
import { authenticate } from '../middleware/authenticate';
import { requireNonDemo } from '../middleware/requireNonDemo';

const router = Router();

// Friend management
router.get('/', authenticate, requireNonDemo, getFriends);
router.post('/request', authenticate, requireNonDemo, sendFriendRequest);
router.get('/requests', authenticate, requireNonDemo, getPendingRequests);
router.post('/requests/:id/accept', authenticate, requireNonDemo, acceptFriendRequest);
router.post('/requests/:id/decline', authenticate, requireNonDemo, declineFriendRequest);
router.delete('/:friendId', authenticate, requireNonDemo, removeFriend);

// Friend library (read-only)
router.get('/:friendId/library/completed', authenticate, requireNonDemo, getFriendCompleted);
router.get('/:friendId/library/currently-reading', authenticate, requireNonDemo, getFriendCurrentlyReading);
router.get('/:friendId/library/dnf', authenticate, requireNonDemo, getFriendDNF);
router.get('/:friendId/library/want-to-read', authenticate, requireNonDemo, getFriendWantToRead);
router.get('/:friendId/library/stats', authenticate, requireNonDemo, getFriendStats);
router.get('/:friendId/library/favorites', authenticate, requireNonDemo, getFriendFavorites);

export default router;
