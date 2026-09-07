import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';
import * as commandCenterController from '../controllers/commandCenterController.js';

const router = Router();

router.use(authenticateToken);

router.get('/overview', commandCenterController.getOverview);
router.get('/health', commandCenterController.getHealth);
router.get('/trends', commandCenterController.getTrends);
router.get('/developers', commandCenterController.getDevelopers);
router.get('/components', commandCenterController.getComponents);
router.get('/bottlenecks', commandCenterController.getBottlenecks);
router.get('/critical-issues', commandCenterController.getCriticalIssues);
router.get('/briefing', aiRateLimiter, commandCenterController.getBriefing);

export default router;
