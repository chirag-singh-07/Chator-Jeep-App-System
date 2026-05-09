import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { s3Client, S3_BUCKET_NAME } from "../../config/s3";
import { env } from "../../config/env";

// ─── Image Processing Profiles ────────────────────────────────────────────────
// Each profile defines target dimensions and quality to optimize storage & perf.
export const IMAGE_PROFILES = {
  /** Tiny blurred thumbnail for lazy-loading placeholders (1–3 KB) */
  placeholder: { width: 20, height: 20, quality: 40, format: "webp" as const },
  /** Thumbnail – listing cards, restaurant cards (10–25 KB) */
  thumbnail: { width: 300, height: 300, quality: 75, format: "webp" as const },
  /** Medium – detail screens, banners (50–100 KB) */
  medium: { width: 800, height: 600, quality: 80, format: "webp" as const },
  /** Full – hero images, kitchen banners (100–200 KB) */
  full: { width: 1200, height: 900, quality: 85, format: "webp" as const },
} as const;

export type ImageProfileKey = keyof typeof IMAGE_PROFILES;

// ─── Folder Namespacing ────────────────────────────────────────────────────────
export type UploadFolder =
  | "restaurants/logos"
  | "restaurants/banners"
  | "restaurants/legal-docs"
  | "menu-items"
  | "users/avatars"
  | "categories";

// ─── Core Upload Function ──────────────────────────────────────────────────────

/**
 * Processes an image buffer with Sharp, then uploads all requested profile
 * variants to S3. Returns a map of { profileKey -> public CDN URL }.
 */
export async function processAndUpload(
  buffer: Buffer,
  folder: UploadFolder,
  profiles: ImageProfileKey[] = ["thumbnail", "medium"]
): Promise<Record<ImageProfileKey, string>> {
  const baseKey = randomUUID();
  const urls: Partial<Record<ImageProfileKey, string>> = {};

  await Promise.all(
    profiles.map(async (profileKey) => {
      const profile = IMAGE_PROFILES[profileKey];

      // Process with Sharp: resize + convert to WebP for smallest file size
      const processed = await sharp(buffer)
        .resize(profile.width, profile.height, {
          fit: "cover",      // crop to fill — consistent aspect ratio
          position: "center",
          withoutEnlargement: true, // never upscale smaller source images
        })
        .webp({ quality: profile.quality, effort: 4 }) // effort 4 = good compression speed balance
        .toBuffer();

      const s3Key = `${folder}/${baseKey}/${profileKey}.webp`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: s3Key,
          Body: processed,
          ContentType: "image/webp",
          ContentLength: processed.length,
          // Cache 1 year – WebP images are content-addressed by uuid
          CacheControl: "public, max-age=31536000, immutable",
          Metadata: {
            profile: profileKey,
            originalSize: buffer.length.toString(),
            processedSize: processed.length.toString(),
          },
        })
      );

      // Construct the public URL
      urls[profileKey] = buildPublicUrl(s3Key);
    })
  );

  return urls as Record<ImageProfileKey, string>;
}

/**
 * Uploads a raw file buffer to S3 without processing.
 * Useful for PDFs or non-image documents.
 */
export async function uploadRawFile(
  buffer: Buffer,
  folder: UploadFolder,
  fileName: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const s3Key = `${folder}/${randomUUID()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return { key: s3Key, url: buildPublicUrl(s3Key) };
}

/**
 * Generates a short-lived pre-signed upload URL for direct client-side uploads.
 * Clients upload directly to S3, then call the confirm endpoint.
 */
export async function generatePresignedUploadUrl(
  folder: UploadFolder,
  fileExtension: string = "jpg",
  expiresIn: number = 300 // 5 minutes
): Promise<{ uploadUrl: string; key: string }> {
  const key = `${folder}/${randomUUID()}/original.${fileExtension}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return { uploadUrl, key };
}

/**
 * Generates a short-lived pre-signed download URL for private assets.
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Deletes all variant files uploaded under a base key prefix.
 * Pass the prefix e.g. "kitchens/logos/<uuid>" to delete all profile sizes.
 */
export async function deleteUploadedFiles(keys: string[]): Promise<void> {
  await Promise.all(
    keys.map((key) =>
      s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }))
    )
  );
}

/**
 * Lists all objects in the bucket, returning keys and public URLs.
 */
export async function listAllFiles(): Promise<Array<{ key: string; url: string; size?: number; lastModified?: Date }>> {
  try {
    console.log("S3: Listing all files in bucket:", S3_BUCKET_NAME);
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      console.log("S3: No files found in bucket.");
      return [];
    }

    console.log(`S3: Found ${response.Contents.length} files.`);
    return response.Contents.map((obj) => ({
      key: obj.Key!,
      url: buildPublicUrl(obj.Key!),
      size: obj.Size,
      lastModified: obj.LastModified,
    }));
  } catch (error) {
    console.error("S3: Failed to list files:", error);
    throw error; // Rethrow to be caught by the controller
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPublicUrl(key: string): string {
  // Priority: Custom public domain > Tigris standard domain
  const bucket = S3_BUCKET_NAME;
  const domain = env.AWS_PUBLIC_DOMAIN || `${bucket}.t3.tigrisfiles.io`;
  return `https://${domain}/${key}`;
}
