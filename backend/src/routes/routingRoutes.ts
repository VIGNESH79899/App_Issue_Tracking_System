import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import * as routingController from '../controllers/routingController.js';

const router = Router();

router.get('/:id/routing-recommendations', authenticateToken, routingController.getSmartAssigneeRecommendations);

export default router;
