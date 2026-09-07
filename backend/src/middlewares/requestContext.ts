import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Augment Express Request to carry requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

const REQUEST_ID_REGEX = /^[a-zA-Z0-9\-_.]{8,64}$/;

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  let requestId = req.headers['x-request-id'] as string | undefined;

  // Validate and sanitize client-provided ID to prevent log injection
  if (requestId) {
    if (!REQUEST_ID_REGEX.test(requestId)) {
      // Invalid format — generate a fresh one
      requestId = randomUUID();
    }
  } else {
    requestId = randomUUID();
  }

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
