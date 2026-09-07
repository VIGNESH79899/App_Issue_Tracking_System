import { env } from '../config/env.js';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  errorCode?: string;
  [key: string]: unknown;
}

// Sensitive fields that must NEVER appear in logs
const REDACTED = '[REDACTED]';
const SENSITIVE_KEYS = new Set([
  'password', 'passwordHash', 'hash', 'token', 'refreshToken', 'accessToken',
  'authorization', 'gemini_api_key', 'geminiApiKey', 'GEMINI_API_KEY',
  'database_url', 'databaseUrl', 'DATABASE_URL', 'jwt_secret', 'jwtSecret',
  'JWT_SECRET', 'apiKey', 'api_key', 'secret',
]);

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
      out[key] = REDACTED;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = sanitize(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

const LEVEL_ORDER: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

function shouldLog(level: LogLevel): boolean {
  const minLevel: LogLevel = env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

function emit(level: LogLevel, message: string, meta: Partial<LogEntry> = {}) {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitize(meta as Record<string, unknown>),
  };

  if (env.NODE_ENV === 'production') {
    // Structured JSON for log aggregation
    process.stdout.write(JSON.stringify(entry) + '\n');
  } else {
    // Human-readable for development
    const prefix = `[${entry.timestamp}] [${level}]`;
    const rid = entry.requestId ? ` [${entry.requestId}]` : '';
    const extra = entry.durationMs !== undefined ? ` ${entry.durationMs}ms` : '';
    console.log(`${prefix}${rid}${extra} ${message}`);
  }
}

export const logger = {
  debug: (message: string, meta?: Partial<LogEntry>) => emit('DEBUG', message, meta),
  info: (message: string, meta?: Partial<LogEntry>) => emit('INFO', message, meta),
  warn: (message: string, meta?: Partial<LogEntry>) => emit('WARN', message, meta),
  error: (message: string, meta?: Partial<LogEntry>) => emit('ERROR', message, meta),
};
