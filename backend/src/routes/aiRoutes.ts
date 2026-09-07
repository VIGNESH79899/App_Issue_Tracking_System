import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';
import * as aiController from '../controllers/aiController.js';

const router = Router();

router.use(authenticateToken);

router.get('/:id/ai-insights', aiRateLimiter, aiController.getAiInsights);
router.post('/:id/ai-insights/regenerate', aiRateLimiter, aiController.regenerateAiInsights);

export default router;
