import { z } from 'zod';
import { UserRole, IssueStatus, IssuePriority, IssueSeverity } from './enums.js';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const createApplicationSchema = z.object({
  name: z.string().min(2, 'Application name must be at least 2 characters'),
  code: z.string().min(2, 'Application code must be at least 2 characters').toUpperCase(),
  description: z.string().optional(),
  version: z.string().optional().default('1.0.0'),
  ownerId: z.string().uuid().optional().nullable(),
});

export const createProjectSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  key: z.string().min(2, 'Project key must be at least 2 characters').toUpperCase(),
  description: z.string().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
});

export const createIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  applicationId: z.string().uuid('Invalid application ID'),
  projectId: z.string().uuid('Invalid project ID'),
  moduleComponent: z.string().optional(),
  assigneeId: z.string().uuid('Invalid assignee ID').optional().nullable(),
  priority: z.nativeEnum(IssuePriority).default(IssuePriority.MEDIUM),
  severity: z.nativeEnum(IssueSeverity).default(IssueSeverity.MINOR),
  environment: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  dueDate: z.string().optional().nullable(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  moduleComponent: z.string().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(IssueStatus).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  severity: z.nativeEnum(IssueSeverity).optional(),
  environment: z.string().optional().nullable(),
  stepsToReproduce: z.string().optional().nullable(),
  expectedResult: z.string().optional().nullable(),
  actualResult: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty'),
  isInternal: z.boolean().optional().default(false),
});

export const issueQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  applicationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  severity: z.nativeEnum(IssueSeverity).optional(),
  assigneeId: z.string().uuid().optional(),
  reporterId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type IssueQueryInput = z.infer<typeof issueQuerySchema>;
