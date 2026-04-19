import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppError } from "../errors/app-error";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ─── In-Memory Storage ─────────────────────────────────────────────────────────
// We never write to disk. Sharp processes from buffer then sends to S3.
const memoryStorage = multer.memoryStorage();

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF`,
        400
      )
    );
  }
}

/** Middleware: single image upload, max 10 MB */
export const uploadSingle = (fieldName: string) =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter,
  }).single(fieldName);

/** Middleware: multiple images in one field, up to 10 files, max 10 MB each */
export const uploadMultiple = (fieldName: string, maxCount = 10) =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
  }).array(fieldName, maxCount);

/** Middleware: named fields (e.g. logo + banner separately) */
export const uploadFields = (fields: { name: string; maxCount?: number }[]) =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
  }).fields(fields);
