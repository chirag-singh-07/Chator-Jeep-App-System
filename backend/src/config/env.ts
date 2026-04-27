import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  REDIS_URL: z.string().optional(),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_REQUIRED: z.coerce.boolean().default(false),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*"),
  // AWS / S3-compatible storage
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().default("auto"),
  AWS_ENDPOINT_URL_S3: z.string().url(),
  AWS_BUCKET_NAME: z.string().default("chatori-jeep-media"),
  BACKEND_URL: z.string().url().optional(),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment validation failed", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
