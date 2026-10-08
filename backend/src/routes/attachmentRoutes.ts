import { Router } from 'express';
import * as attachmentController from '../controllers/attachmentController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/:id/download', attachmentController.downloadAttachment);
router.delete('/:id', attachmentController.deleteAttachment);

export default router;
