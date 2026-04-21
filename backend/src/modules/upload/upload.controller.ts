import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import {
  processAndUpload,
  generatePresignedUploadUrl,
  deleteUploadedFiles,
  listAllFiles,
  ImageProfileKey,
  UploadFolder,
} from "../../common/services/upload.service";
import { AppError } from "../../common/errors/app-error";

// ─── POST /api/v1/uploads/single  ─────────────────────────────────────────────
/**
 * Upload one image and return processed WebP variants.
 * Body (form-data): file, folder, profiles (optional comma-separated list)
 */
export const uploadSingleImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const file = req.file;
    if (!file) throw new AppError("No file received", 400);

    const folder = (req.body.folder as UploadFolder) ?? "menu-items";
    const profilesParam = (req.body.profiles as string) ?? "thumbnail,medium";
    const profiles = profilesParam
      .split(",")
      .map((p) => p.trim()) as ImageProfileKey[];

    const urls = await processAndUpload(file.buffer, folder, profiles);

    res.status(201).json({
      success: true,
      message: "Image uploaded and processed",
      data: { urls, originalName: file.originalname, size: file.size },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/uploads/multiple  ───────────────────────────────────────────
/**
 * Upload up to 10 images in one request.
 * Body (form-data): files[], folder, profiles
 */
export const uploadMultipleImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0)
      throw new AppError("No files received", 400);

    const folder = (req.body.folder as UploadFolder) ?? "menu-items";
    const profilesParam = (req.body.profiles as string) ?? "thumbnail,medium";
    const profiles = profilesParam
      .split(",")
      .map((p) => p.trim()) as ImageProfileKey[];

    // Process all images in parallel
    const results = await Promise.all(
      files.map(async (file) => {
        const urls = await processAndUpload(file.buffer, folder, profiles);
        return { originalName: file.originalname, size: file.size, urls };
      }),
    );

    res.status(201).json({
      success: true,
      message: `${files.length} images uploaded and processed`,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/uploads/restaurant-brand  ───────────────────────────────────
/**
 * Specialized endpoint for restaurant registration: uploads logo + banner together.
 * Fields: logo (single), banner (single)
 */
export const uploadRestaurantBrand = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const filesMap = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;

    if (!filesMap) throw new AppError("No files received", 400);

    const logoFile = filesMap["logo"]?.[0];
    const bannerFile = filesMap["banner"]?.[0];

    if (!logoFile && !bannerFile) {
      throw new AppError("Provide at least a logo or banner file", 400);
    }

    const [logoUrls, bannerUrls] = await Promise.all([
      logoFile
        ? processAndUpload(logoFile.buffer, "restaurants/logos", [
            "placeholder",
            "thumbnail",
            "medium",
          ])
        : null,
      bannerFile
        ? processAndUpload(bannerFile.buffer, "restaurants/banners", [
            "placeholder",
            "medium",
            "full",
          ])
        : null,
    ]);

    res.status(201).json({
      success: true,
      message: "Restaurant branding uploaded",
      data: {
        logo: logoUrls,
        banner: bannerUrls,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/uploads/avatar  ─────────────────────────────────────────────
/**
 * Upload a user / delivery agent avatar (square crop).
 * Body (form-data): file (field name "avatar")
 */
export const uploadAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const file = req.file;
    if (!file) throw new AppError("No avatar file received", 400);

    const urls = await processAndUpload(file.buffer, "users/avatars", [
      "placeholder",
      "thumbnail",
    ]);

    res.status(201).json({
      success: true,
      message: "Avatar uploaded",
      data: { urls },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/uploads/presign  ────────────────────────────────────────────
/**
 * Generate a pre-signed URL so the client can upload directly to S3
 * without routing the binary through our server.
 * Body (JSON): { folder, extension }
 */
export const getPresignedUploadUrl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { folder, extension = "jpg" } = req.body as {
      folder: UploadFolder;
      extension?: string;
    };

    if (!folder) throw new AppError("folder is required", 400);

    const { uploadUrl, key } = await generatePresignedUploadUrl(
      folder,
      extension,
    );

    res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        key,
        expiresIn: 300,
        note: "PUT the file directly to uploadUrl, then call /confirm with the key",
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/uploads  ──────────────────────────────────────────────────
/**
 * Delete one or more S3 objects by their keys.
 * Body (JSON): { keys: string[] }
 */
export const deleteImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { keys } = req.body as { keys: string[] };
    if (!Array.isArray(keys) || keys.length === 0) {
      throw new AppError("keys must be a non-empty array", 400);
    }

    await deleteUploadedFiles(keys);

    res.status(200).json({
      success: true,
      message: `${keys.length} file(s) deleted`,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/uploads/admin/all  ───────────────────────────────────────────
/**
 * Admin view: List all files in S3.
 */
export const getAllMedia = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const files = await listAllFiles();
    res.status(200).json({
      success: true,
      data: files,
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/uploads/admin/:key  ───────────────────────────────────────
/**
 * Admin view: Delete a single file from S3 by its key.
 */
export const deleteSingleMedia = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { key } = req.params;
    if (!key) throw new AppError("key parameter is required", 400);

    // Some keys might come encoded or with multiple segments.
    // Usually standard params cover this, but S3 keys with slashes need care.
    // However for now we'll assume standard param.
    await deleteUploadedFiles([key as string]);

    res.status(200).json({
      success: true,
      message: "Asset deleted from bucket",
    });
  } catch (err) {
    next(err);
  }
};
