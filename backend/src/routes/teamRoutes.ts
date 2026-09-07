import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', projectController.getTeamMembers);

export default router;
