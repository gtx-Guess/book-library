import { Router } from 'express';
import multer from 'multer';
import { importGoodReads, startSync, syncAll, getSyncStatus } from '../controllers/importController';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/goodreads', authenticate, upload.single('file'), importGoodReads);
router.post('/sync', authenticate, startSync);
router.post('/sync-all', authenticate, syncAll);
router.get('/sync-status/:syncId', authenticate, getSyncStatus);

export default router;
