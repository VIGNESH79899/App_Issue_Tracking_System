import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, ApiError } from './middlewares/errorHandler.js';
import { requestContext } from './middlewares/requestContext.js';
import { requestLogger } from './middlewares/requestLogger.js';

const app: Express = express();

// Trust reverse proxy (Nginx / ALB / Cloudflare / Render) in production
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ── Security HTTP Headers (Helmet) ──────────────────────────
// Helmet sets X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
// X-XSS-Protection, Strict-Transport-Security, etc.
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP to allow Vite scripts, styles, and SVG icons to execute seamlessly
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Add cache-control for sensitive API responses
app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// ── CORS ─────────────────────────────────────────────────────
// Development: allow configured localhost origin.
// Production: allow configured CORS_ORIGIN (normalizes trailing slashes, supports wildcard).
app.use(
  '/api',
  cors({
    origin: (origin, callback) => {
      const allowed = env.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, ''));
      // Allow same-origin / server-to-server (no origin header)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowed.includes('*') || allowed.includes(normalizedOrigin)) return callback(null, true);
      return callback(new Error(`CORS: Origin '${origin}' is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  })
);

// ── Body Parsers ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Request Correlation ───────────────────────────────────────
// Generates/validates X-Request-ID and attaches req.requestId
app.use(requestContext);

// ── Request Observability Logger ─────────────────────────────
// Records method/route/status/duration → metricsService
app.use(requestLogger);

// ── Static Uploads ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ── Serve Frontend SPA in Single-Service Mode ─────────────────
const frontendDist = path.join(process.cwd(), 'frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next(ApiError.notFound('Requested API route does not exist'));
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // ── 404 Handler for pure API mode ───────────────────────────
  app.use('*', (_req: Request, _res: Response, next: NextFunction) => {
    next(ApiError.notFound('Requested API route does not exist'));
  });
}

// ── Centralized Error Handler ─────────────────────────────────
app.use(errorHandler);

export default app;
