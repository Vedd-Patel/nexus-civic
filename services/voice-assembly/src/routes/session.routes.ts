import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import {
  createSession,
  listSessions,
  getSession,
  joinSession,
  submitIssue,
  castVote,
} from '../controllers/session.controller';

const router = Router();

// Public routes
router.get('/', listSessions);
router.get('/:id', getSession);

// Admin routes
router.post('/', requireAdmin, createSession);

// Authenticated user routes
router.post('/:id/join', requireAuth, joinSession);
router.post('/:id/issue', requireAuth, submitIssue);
router.post('/:id/vote', requireAuth, castVote);

export default router;
