import { Router } from 'express';
import { getSummary, getAnomalies, askQuestion } from '../controllers/budget.controller';

const router = Router();

router.get('/summary', getSummary);
router.get('/anomalies', getAnomalies);
router.post('/ask', askQuestion);

export default router;
