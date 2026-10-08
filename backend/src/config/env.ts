import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from backend or working directory
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/app_issue_track?schema=public'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('super-secret-jwt-key-replace-in-production-minimum-32-chars'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  AI_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  AI_PROVIDER: z.string().default('gemini'),
  AI_MODEL: z.string().default('gemini-3.6-flash'),
  GEMINI_API_KEY: z.string().default(''),
  AI_RATE_LIMIT_PER_MIN: z.coerce.number().default(10),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment configuration:', _env.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = _env.data;

// Development defaults are useful locally, but must never silently become a
// production signing key.
if (
  env.NODE_ENV === 'production' &&
  env.JWT_SECRET === 'super-secret-jwt-key-replace-in-production-minimum-32-chars'
) {
  throw new Error('JWT_SECRET must be explicitly configured in production');
}
