import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', notificationController.getUserNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

export default router;
