import { Router } from 'express';
import {
  getAllCurrentlyReadingBooks,
  addCurrentlyReadingBook,
  updateCurrentlyReadingBook,
  deleteCurrentlyReadingBook,
} from '../controllers/currentlyReadingController';
import { authenticate } from '../middleware/authenticate';
import { demoLimitCheck } from '../middleware/demoLimits';

const router = Router();

router.get('/', authenticate, getAllCurrentlyReadingBooks);
router.post('/', authenticate, demoLimitCheck('currentlyReading'), addCurrentlyReadingBook);
router.patch('/:id', authenticate, updateCurrentlyReadingBook);
router.delete('/:id', authenticate, deleteCurrentlyReadingBook);

export default router;
