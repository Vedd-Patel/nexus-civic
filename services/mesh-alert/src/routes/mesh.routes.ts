import { Router } from 'express';
import { z } from 'zod';

import { getActiveNodes, registerNode } from '../controllers/mesh.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';

const router = Router();

const registerNodeSchema = z.object({
  deviceId: z.string().min(1),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number().optional(),
    address: z.string().optional(),
    s2CellId: z.string().optional(),
  }),
  batteryLevel: z.number().min(0).max(100).optional(),
  meshCapabilities: z.array(z.string().min(1)).min(1),
});

// POST /api/mesh/nodes (no auth)
router.post('/nodes', validate(registerNodeSchema), asyncHandler(registerNode));

// GET /api/mesh/nodes/active (admin only)
router.get('/nodes/active', authenticate, requireAdmin, asyncHandler(getActiveNodes));

export default router;
