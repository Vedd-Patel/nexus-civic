import { Router } from 'express';
import { z } from 'zod';

import {
  createRescueEvent,
  getActiveRescueMap,
  receiveMeshSOS,
} from '../controllers/rescue.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';

const router = Router();

const createRescueEventSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number().optional(),
    address: z.string().optional(),
    s2CellId: z.string().optional(),
  }),
  type: z.string().min(1),
  description: z.string().optional(),
  reportedBy: z.string().min(1),
  meshNodes: z.array(z.string()).default([]),
  status: z.enum(['ACTIVE', 'CONTAINED', 'RESOLVED']).optional(),
});

// POST /api/rescue/events (authenticate)
router.post('/events', authenticate, validate(createRescueEventSchema), asyncHandler(createRescueEvent));

// GET /api/rescue/events (public)
router.get('/events', asyncHandler(getActiveRescueMap));

// POST /api/rescue/sos (NO AUTH — emergency)
router.post('/sos', asyncHandler(receiveMeshSOS));

export default router;
