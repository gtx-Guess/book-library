import { Router } from 'express';
import {
  getAllWantToReadBooks,
  addWantToReadBook,
  updateWantToReadBook,
  deleteWantToReadBook,
} from '../controllers/wantToReadController';
import { authenticate } from '../middleware/authenticate';
import { demoLimitCheck } from '../middleware/demoLimits';

const router = Router();

router.get('/', authenticate, getAllWantToReadBooks);
router.post('/', authenticate, demoLimitCheck('wantToRead'), addWantToReadBook);
router.patch('/:id', authenticate, updateWantToReadBook);
router.delete('/:id', authenticate, deleteWantToReadBook);

export default router;
