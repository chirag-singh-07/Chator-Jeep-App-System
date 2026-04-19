import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

/**
 * S3-compatible client (Tigris / T3 Storage via AWS SDK v3)
 * Uses custom endpoint from AWS_ENDPOINT_URL_S3 env variable.
 */
export const s3Client = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // Tigris uses virtual-hosted style
});

export const S3_BUCKET_NAME = env.AWS_BUCKET_NAME;
