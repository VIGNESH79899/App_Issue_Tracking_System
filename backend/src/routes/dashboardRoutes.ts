import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/summary', dashboardController.getSummaryMetrics);
router.get('/issues-by-status', dashboardController.getIssuesByStatus);
router.get('/issues-by-priority', dashboardController.getIssuesByPriority);
router.get('/issues-by-severity', dashboardController.getIssuesBySeverity);
router.get('/issues-by-application', dashboardController.getIssuesByApplication);
router.get('/developer-workload', dashboardController.getDeveloperWorkloads);
router.get('/resolution-metrics', dashboardController.getResolutionMetrics);

export default router;
