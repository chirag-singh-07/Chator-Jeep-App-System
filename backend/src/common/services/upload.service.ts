import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { s3Client, S3_BUCKET_NAME } from "../../config/s3";

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
  const baseKey = uuidv4();
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
 * Generates a short-lived pre-signed upload URL for direct client-side uploads.
 * Clients upload directly to S3, then call the confirm endpoint.
 */
export async function generatePresignedUploadUrl(
  folder: UploadFolder,
  fileExtension: string = "jpg",
  expiresIn: number = 300 // 5 minutes
): Promise<{ uploadUrl: string; key: string }> {
  const key = `${folder}/${uuidv4()}/original.${fileExtension}`;
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
  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET_NAME,
  });

  const response = await s3Client.send(command);
  
  if (!response.Contents) return [];

  return response.Contents.map((obj) => ({
    key: obj.Key!,
    url: buildPublicUrl(obj.Key!),
    size: obj.Size,
    lastModified: obj.LastModified,
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPublicUrl(key: string): string {
  // Tigris endpoint pattern: https://<bucket>.<endpoint>/<key>
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 ?? "";
  const bucket = S3_BUCKET_NAME;
  const base = endpoint.replace("https://", `https://${bucket}.`);
  return `${base}/${key}`;
}
