import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '@app-issue-track/shared';
import { logger } from '../observability/logger.js';
import { recordSecurityEvent } from '../observability/securityEvents.js';
import { env } from '../config/env.js';

// ============================================================
// Stable Error Codes
// ============================================================
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'DATABASE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | string; // allow legacy codes

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'AUTHENTICATION_REQUIRED', message);
  }

  static forbidden(message = 'Forbidden resource access') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string) {
    return new ApiError(409, 'CONFLICT', message);
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  static serviceUnavailable(message = 'Dependency unavailable') {
    return new ApiError(503, 'DEPENDENCY_UNAVAILABLE', message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}

// ============================================================
// Global Error Handler
// ============================================================
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const requestId = req.requestId;

  if (err instanceof ApiError) {
    // Log security events for auth/forbidden failures
    if (err.statusCode === 401) {
      recordSecurityEvent({
        type: 'AUTH_FAILURE',
        requestId,
        userId: req.user?.userId,
        route: req.originalUrl,
        method: req.method,
        message: err.message,
      });
    } else if (err.statusCode === 403) {
      recordSecurityEvent({
        type: 'FORBIDDEN_ACCESS',
        requestId,
        userId: req.user?.userId,
        route: req.originalUrl,
        method: req.method,
        message: err.message,
      });
    } else if (err.statusCode === 429) {
      recordSecurityEvent({
        type: 'RATE_LIMIT',
        requestId,
        userId: req.user?.userId,
        route: req.originalUrl,
        method: req.method,
        message: err.message,
      });
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details as any[] | undefined,
      },
      timestamp,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        requestId,
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      timestamp,
    };
    res.status(400).json(response);
    return;
  }

  // Unexpected error — sanitize before sending
  logger.error('Unhandled exception', {
    requestId,
    errorCode: 'INTERNAL_ERROR',
    route: req.originalUrl,
    method: req.method,
    userId: req.user?.userId,
  });

  // Detect Prisma errors without leaking internals
  const errMsg = err.message || '';
  const isPrismaError = errMsg.includes('Prisma') || errMsg.includes('PrismaClient');
  const statusCode = isPrismaError ? 503 : 500;
  const code = isPrismaError ? 'DATABASE_UNAVAILABLE' : 'INTERNAL_ERROR';
  const safeMessage = isPrismaError
    ? 'Database service is temporarily unavailable'
    : 'An unexpected internal error occurred';

  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message: safeMessage,
      requestId,
      // Include stack traces ONLY in development
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
    timestamp,
  };
  res.status(statusCode).json(response);
};
