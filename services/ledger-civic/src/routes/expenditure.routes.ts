import { Router } from 'express';
import { createExpenditure, listExpenditures, getExpenditure } from '../controllers/expenditure.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', listExpenditures);
router.get('/:id', getExpenditure);
router.post('/', authenticate, createExpenditure);

export default router;
