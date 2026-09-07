import { Router } from 'express';
import { createProjectSchema, UserRole } from '@app-issue-track/shared';
import * as projectController from '../controllers/projectController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.use(authenticateToken);

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validateBody(createProjectSchema),
  projectController.createProject
);

router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  projectController.updateProject
);

router.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  projectController.deleteProject
);

// Project Member Management Routes
router.get('/:id/members', projectController.getProjectMembers);

router.post(
  '/:id/members',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  projectController.addProjectMember
);

router.delete(
  '/:id/members/:userId',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  projectController.removeProjectMember
);

export default router;
