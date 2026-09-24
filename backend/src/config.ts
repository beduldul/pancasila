import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const localEnvPath = path.join(process.cwd(), '.env');
const compiledEnvPath = path.join(__dirname, '../../.env');
const envPath = fs.existsSync(localEnvPath) ? localEnvPath : compiledEnvPath;

dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(4000),
  DATABASE_URL: z.string().url().describe('Prisma connection URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(Number).default(12),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  ADMIN_SECRET_KEY: z.string().min(16, 'ADMIN_SECRET_KEY must be at least 16 characters'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = parsed.data;
export const IS_PROD = config.NODE_ENV === 'production';
