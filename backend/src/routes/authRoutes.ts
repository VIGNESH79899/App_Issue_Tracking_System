import { Router } from 'express';
import { loginSchema, registerSchema } from '@app-issue-track/shared';
import * as authController from '../controllers/authController.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authRateLimiter } from '../middlewares/generalRateLimiter.js';

const router = Router();

// Rate limit authentication endpoints to prevent brute force
router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authRateLimiter, authController.refresh);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.me);

export default router;
