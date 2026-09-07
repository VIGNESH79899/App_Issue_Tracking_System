import { Router } from 'express';
import { createApplicationSchema, UserRole } from '@app-issue-track/shared';
import * as applicationController from '../controllers/applicationController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.use(authenticateToken);

router.get('/', applicationController.getApplications);
router.get('/:id', applicationController.getApplicationById);

router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validateBody(createApplicationSchema),
  applicationController.createApplication
);

router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  applicationController.updateApplication
);

router.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  applicationController.deleteApplication
);

export default router;
