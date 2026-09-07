import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@app-issue-track/shared';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { ApiError } from './errorHandler.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return next(ApiError.unauthorized('User account is inactive or no longer exists'));
    }

    req.user = decoded;
    next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired access token'));
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Action requires one of the following roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};
