import { Router } from 'express';
import { getGoalByYear, setGoalForYear } from '../controllers/goalsController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/:year', authenticate, getGoalByYear);
router.post('/:year', authenticate, setGoalForYear);

export default router;
