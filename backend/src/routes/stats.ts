import { Router } from 'express';
import { getYearlyStats, getAllYears, getAllYearsWithStats } from '../controllers/statsController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/years', authenticate, getAllYears);
router.get('/all-years', authenticate, getAllYearsWithStats);
router.get('/:year', authenticate, getYearlyStats);

export default router;
