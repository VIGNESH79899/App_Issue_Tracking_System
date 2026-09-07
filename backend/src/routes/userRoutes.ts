import { Router } from 'express';
import { UserRole } from '@app-issue-track/shared';
import * as userController from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', requireRole(UserRole.ADMIN), userController.toggleUserStatus);
router.patch('/:id/role', requireRole(UserRole.ADMIN), userController.changeUserRole);
router.delete('/:id', requireRole(UserRole.ADMIN), userController.deleteUser);

export default router;
