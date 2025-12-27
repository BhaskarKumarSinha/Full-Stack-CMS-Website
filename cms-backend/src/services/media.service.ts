// src/services/media.service.ts
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import config from "../config";
import logger from "../utils/logger";
import MediaAssetModel from "../models/MediaAsset";
import {
  uploadBufferToS3,
  getPresignedPutUrl,
  deleteFromS3,
} from "../utils/s3";

// Use project-level uploads folder (one level above src)
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

/**
 * Ensure uploads dir exists for local mode
 */
function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR))
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Save a buffer either to S3 (if configured) or locally.
 * Returns MediaAsset doc.
 */
export async function saveBufferAsMedia(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  uploadedBy?: string
) {
  const ext = path.extname(originalName) || "";
  const filename = `${Date.now()}-${uuidv4()}${ext}`;
  if (config.S3_BUCKET) {
    // S3 mode
    const key = `uploads/${filename}`;
    const { url } = await uploadBufferToS3(buffer, key, mimeType);
    const doc = new MediaAssetModel({
      fileName: filename,
      url,
      mimeType,
      size: buffer.length,
      uploadedBy,
    });
    await doc.save();
    return doc;
  } else {
    // Local disk mode
    ensureUploadsDir();
    const outPath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    // serve via server static route: /uploads/<filename>
    const serverBase =
      config.FILE_BASE_URL ||
      config.API_BASE_URL ||
      `http://localhost:${config.PORT}`;
    const url = `${serverBase.replace(/\/$/, "")}/uploads/${encodeURIComponent(
      filename
    )}`;
    const doc = new MediaAssetModel({
      fileName: filename,
      url,
      mimeType,
      size: buffer.length,
      uploadedBy,
    });
    await doc.save();
    return doc;
  }
}

/**
 * Create presigned upload URL (S3 only).
 */
export async function createPresignedUploadUrl(
  originalName: string,
  mimeType: string,
  expiresInSeconds = 300
) {
  if (!config.S3_BUCKET)
    throw new Error("Presign not available: S3 not configured");
  const ext = path.extname(originalName) || "";
  const filename = `${Date.now()}-${uuidv4()}${ext}`;
  const key = `uploads/${filename}`;
  const presignedUrl = await getPresignedPutUrl(
    key,
    mimeType,
    expiresInSeconds
  );
  // compute final public url (after PUT completes)
  const finalUrl = `https://${config.S3_BUCKET}.s3.${
    config.AWS_REGION
  }.amazonaws.com/${encodeURIComponent(key)}`;
  return { presignedUrl, filename, key, finalUrl };
}

/**
 * List media assets (admin)
 */
export async function listMedia(skip = 0, limit = 50) {
  const docs = await MediaAssetModel.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return docs.map((d: any) => ({
    id: d._id.toString(),
    fileName: d.fileName,
    url: d.url,
    mimeType: d.mimeType,
    size: d.size,
    uploadedBy: d.uploadedBy,
    createdAt: d.createdAt,
  }));
}

/**
 * Delete media asset (S3 or local)
 */
export async function deleteMediaAsset(id: string) {
  const doc = await MediaAssetModel.findById(id);
  if (!doc) throw { status: 404, message: "Media not found" };
  // delete from storage
  if (config.S3_BUCKET) {
    // extract key from url or store key separately; here we assume key = uploads/<filename>
    const key = `uploads/${doc.fileName}`;
    await deleteFromS3(key);
  } else {
    const filePath = path.join(UPLOADS_DIR, doc.fileName);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      logger.warn("Failed to delete local file %s: %o", filePath, err);
    }
  }
  await doc.deleteOne();
  return true;
}
