import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { env } from "../../config/env";
import { AppError } from "../errors/app-error";

// ─── Constants ────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "../../../../uploads");

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
  | "delivery/documents"
  | "menu-items"
  | "users/avatars"
  | "categories";

// ─── Core Upload Function ──────────────────────────────────────────────────────

/**
 * Processes an image buffer with Sharp, then saves all requested profile
 * variants to the local file system. Returns a map of { profileKey -> public URL }.
 */
export async function processAndUpload(
  buffer: Buffer,
  folder: UploadFolder,
  profiles: ImageProfileKey[] = ["thumbnail", "medium"]
): Promise<Record<ImageProfileKey, string>> {
  const baseKey = randomUUID();
  const urls: Partial<Record<ImageProfileKey, string>> = {};

  // Ensure the directory exists
  const targetDir = path.join(UPLOADS_DIR, folder, baseKey);
  await fs.mkdir(targetDir, { recursive: true });

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

      const fileName = `${profileKey}.webp`;
      const filePath = path.join(targetDir, fileName);

      await fs.writeFile(filePath, processed);

      const fileKey = `${folder}/${baseKey}/${fileName}`;
      // Construct the public URL
      urls[profileKey] = buildPublicUrl(fileKey);
    })
  );

  return urls as Record<ImageProfileKey, string>;
}

/**
 * Uploads a raw file buffer to the local file system without processing.
 * Useful for PDFs or non-image documents.
 */
export async function uploadRawFile(
  buffer: Buffer,
  folder: UploadFolder,
  fileName: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const fileUUID = randomUUID();
  const targetDir = path.join(UPLOADS_DIR, folder);
  await fs.mkdir(targetDir, { recursive: true });

  const finalFileName = `${fileUUID}-${fileName}`;
  const filePath = path.join(targetDir, finalFileName);

  await fs.writeFile(filePath, buffer);

  const fileKey = `${folder}/${finalFileName}`;
  return { key: fileKey, url: buildPublicUrl(fileKey) };
}

/**
 * Generates a short-lived pre-signed upload URL for direct client-side uploads.
 * Not supported for local storage.
 */
export async function generatePresignedUploadUrl(
  folder: UploadFolder,
  fileExtension: string = "jpg",
  expiresIn: number = 300 // 5 minutes
): Promise<{ uploadUrl: string; key: string }> {
  throw new AppError("Presigned URLs are not supported when using local storage. Please use the multipart/form-data upload endpoints instead.", 501);
}

/**
 * Generates a short-lived pre-signed download URL for private assets.
 * For local storage, we just return the public URL (or you can implement a token-based system).
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  return buildPublicUrl(key);
}

/**
 * Deletes all variant files uploaded under a base key prefix.
 */
export async function deleteUploadedFiles(keys: string[]): Promise<void> {
  await Promise.all(
    keys.map(async (key) => {
      try {
        const filePath = path.join(UPLOADS_DIR, key);
        
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            await fs.rm(filePath, { recursive: true, force: true });
        } else {
            await fs.unlink(filePath);
        }
      } catch (err) {
        console.error(`Failed to delete local file ${key}:`, err);
      }
    })
  );
}

/**
 * Lists all objects in the uploads directory recursively.
 */
export async function listAllFiles(): Promise<Array<{ key: string; url: string; size?: number; lastModified?: Date }>> {
  try {
    const files: Array<{ key: string; url: string; size?: number; lastModified?: Date }> = [];

    async function walkDir(dir: string, baseDir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walkDir(fullPath, baseDir);
          } else {
            const stat = await fs.stat(fullPath);
            // Construct the key relative to UPLOADS_DIR
            const relativeKey = path.relative(baseDir, fullPath).split(path.sep).join('/');
            files.push({
              key: relativeKey,
              url: buildPublicUrl(relativeKey),
              size: stat.size,
              lastModified: stat.mtime,
            });
          }
        }
      } catch (err) {
        // Ignore if directory doesn't exist
      }
    }

    await walkDir(UPLOADS_DIR, UPLOADS_DIR);
    return files;
  } catch (error) {
    console.error("Local Storage: Failed to list files:", error);
    throw error;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPublicUrl(key: string): string {
  // Use BACKEND_URL to serve the file
  const domain = env.BACKEND_URL || "http://localhost:5000";
  // ensure no double slashes between domain and uploads
  const cleanDomain = domain.endsWith("/") ? domain.slice(0, -1) : domain;
  return `${cleanDomain}/uploads/${key}`;
}
