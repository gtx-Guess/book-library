import { Router } from 'express';
import {
  getAllDNFBooks,
  addDNFBook,
  updateDNFBook,
  deleteDNFBook,
} from '../controllers/dnfController';
import { authenticate } from '../middleware/authenticate';
import { demoLimitCheck } from '../middleware/demoLimits';

const router = Router();

router.get('/', authenticate, getAllDNFBooks);
router.post('/', authenticate, demoLimitCheck('dnf'), addDNFBook);
router.patch('/:id', authenticate, updateDNFBook);
router.delete('/:id', authenticate, deleteDNFBook);

export default router;
