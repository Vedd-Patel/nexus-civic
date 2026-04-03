import { Router } from 'express';

import { confirmSync, getPendingSync } from '../controllers/sync.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// GET /api/sync/pending/:nodeId (no auth)
router.get('/pending/:nodeId', asyncHandler(getPendingSync));

// POST /api/sync/confirm/:nodeId (no auth)
router.post('/confirm/:nodeId', asyncHandler(confirmSync));

export default router;
