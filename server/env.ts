import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(20, 'OPENAI_API_KEY must be at least 20 characters'),
  APP_ACCESS_PASSWORD: z.string().min(8, 'APP_ACCESS_PASSWORD must be at least 8 characters'),
  APP_SESSION_SECRET: z.string().min(32, 'APP_SESSION_SECRET must be at least 32 characters'),
  PORT: z.coerce.number().int().positive().default(3001),
  SYSTEM_PROMPT_FILE: z.string().optional()
});

export const env = envSchema.parse(process.env);