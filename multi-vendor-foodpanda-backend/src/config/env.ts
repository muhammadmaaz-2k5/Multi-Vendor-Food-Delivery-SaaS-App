import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8000'),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CLOUDINARY_URL: z.string(),
  CLOUDINARY_UPLOAD_PRESET: z.string().default('vendor-food'),
});

export const env = envSchema.parse(process.env);
