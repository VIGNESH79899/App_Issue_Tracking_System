import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';
import * as incidentController from '../controllers/incidentController.js';

const router = Router();

router.use(authenticateToken);

router.post('/', incidentController.createIncident);
router.get('/', incidentController.getIncidents);
router.get('/metrics', incidentController.getIncidentMetrics);
router.get('/:id', incidentController.getIncidentById);
router.post('/:id/acknowledge', incidentController.acknowledgeIncident);
router.post('/:id/status', incidentController.transitionIncidentStatus);
router.post('/:id/assign', incidentController.assignIncidentOwner);
router.post('/:id/resolve', incidentController.resolveIncident);
router.post('/:id/close', incidentController.closeIncident);
router.get('/:id/timeline', incidentController.getIncidentTimeline);
router.get('/:id/related-issues', incidentController.getRelatedIssues);
router.get('/:id/escalations', incidentController.getEscalations);
router.get('/:id/recurrence', incidentController.getIncidentRecurrence);
router.get('/:id/post-incident-analysis', aiRateLimiter, incidentController.getPostIncidentAnalysis);

export default router;
