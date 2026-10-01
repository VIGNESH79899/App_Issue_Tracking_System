import { Router } from 'express';
import { checkHealth, checkLive, checkReady, checkDebug, initDatabase } from '../controllers/healthController.js';

const router = Router();

router.get('/health', checkHealth);
router.get('/health/live', checkLive);
router.get('/health/ready', checkReady);
router.get('/health/debug', checkDebug);
router.post('/health/init-db', initDatabase);

export default router;
