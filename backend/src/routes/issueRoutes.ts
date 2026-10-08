import { Router } from 'express';
import { createIssueSchema, updateIssueSchema, UserRole } from '@app-issue-track/shared';
import * as issueController from '../controllers/issueController.js';
import * as commentController from '../controllers/commentController.js';
import * as attachmentController from '../controllers/attachmentController.js';
import * as historyController from '../controllers/historyController.js';
import * as intelligenceController from '../controllers/intelligenceController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { uploadMiddleware } from '../middlewares/upload.js';
import { uploadRateLimiter } from '../middlewares/generalRateLimiter.js';

const router = Router();

router.use(authenticateToken);

// Issue Core Endpoints
router.get('/', issueController.getIssues);
router.get('/:id', issueController.getIssueById);
router.get('/:id/intelligence', intelligenceController.getIssueIntelligence);

router.post('/', validateBody(createIssueSchema), issueController.createIssue);
router.put('/:id', validateBody(updateIssueSchema), issueController.updateIssue);

router.patch('/:id/status', issueController.changeStatus);

router.patch(
  '/:id/assign',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  issueController.assignIssue
);

router.delete(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  issueController.deleteIssue
);

// Nested Issue History Endpoint
router.get('/:id/history', historyController.getIssueHistory);

// Nested Issue Comments Endpoints
router.get('/:id/comments', commentController.getCommentsByIssue);
router.post('/:id/comments', commentController.createComment);

// Nested Issue Attachments Endpoints
router.get('/:id/attachments', attachmentController.getAttachmentsByIssue);
router.post(
  '/:id/attachments',
  uploadRateLimiter,
  uploadMiddleware.single('file'),
  attachmentController.uploadAttachment
);

export default router;
