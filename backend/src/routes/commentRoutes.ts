import { Router } from 'express';
import { createCommentSchema } from '@app-issue-track/shared';
import * as commentController from '../controllers/commentController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.use(authenticateToken);

router.put('/:id', validateBody(createCommentSchema), commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

export default router;
