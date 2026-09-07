import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { UserRole } from '@app-issue-track/shared';
import {
  getOperationsOverview,
  getSecurityEventsHandler,
  getMetricsHandler,
} from '../controllers/operationsController.js';

const router = Router();

// All operations routes require authentication + ADMIN role
router.use(authenticateToken);
router.use(requireRole(UserRole.ADMIN));

router.get('/overview', getOperationsOverview);
router.get('/metrics', getMetricsHandler);
router.get('/security-events', getSecurityEventsHandler);

export default router;
