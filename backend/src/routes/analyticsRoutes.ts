import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = Router();

router.use(authenticateToken);

router.get('/overview', analyticsController.getOverview);
router.get('/backlog', analyticsController.getBacklogForecast);
router.get('/sla', analyticsController.getSlaForecast);
router.get('/capacity', analyticsController.getCapacityForecast);
router.get('/components', analyticsController.getComponentForecast);
router.get('/incidents', analyticsController.getIncidentForecast);
router.get('/delivery-risk', analyticsController.getDeliveryRisk);
router.get('/briefing', aiRateLimiter, analyticsController.getBriefing);

export default router;
