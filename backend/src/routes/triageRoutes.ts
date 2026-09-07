import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';
import * as triageController from '../controllers/triageController.js';

const router = Router();

router.use(authenticateToken);

router.post('/analyze', aiRateLimiter, triageController.analyzeDraftIssue);
router.get('/:id/duplicate-candidates', aiRateLimiter, triageController.getDuplicateCandidates);
router.post('/:id/triage', aiRateLimiter, triageController.triageIssue);

export default router;
