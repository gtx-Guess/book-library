import { Router } from 'express';
import {
  searchBooksFromAPI,
  addCompletedBook,
  getCompletedBooksByYear,
  updateCompletedBook,
  deleteCompletedBook,
  getAllCompletedBooks,
} from '../controllers/booksController';
import { authenticate } from '../middleware/authenticate';
import { demoLimitCheck } from '../middleware/demoLimits';

const router = Router();

router.get('/search', authenticate, searchBooksFromAPI);
router.post('/completed', authenticate, demoLimitCheck('completed'), addCompletedBook);
router.get('/completed/all/paginated', authenticate, getAllCompletedBooks);
router.get('/completed/:year', authenticate, getCompletedBooksByYear);
router.patch('/completed/:id', authenticate, updateCompletedBook);
router.delete('/completed/:id', authenticate, deleteCompletedBook);

export default router;
