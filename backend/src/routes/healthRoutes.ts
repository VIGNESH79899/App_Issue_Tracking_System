import { Router } from 'express';
import { checkHealth, checkLive, checkReady } from '../controllers/healthController.js';

const router = Router();

router.get('/health', checkHealth);
router.get('/health/live', checkLive);
router.get('/health/ready', checkReady);

export default router;
