// src/controllers/media.controller.ts
import { Request, Response } from "express";
import * as mediaService from "../services/media.service";
import { z, ZodError } from "zod";

/**
 * POST /api/media/upload
 * multipart/form-data file field: "files" (supports multiple)
 * protected (admin/editor)
 */
export async function uploadHandler(req: Request, res: Response) {
  try {
    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0)
      return res
        .status(400)
        .json({ message: 'No files uploaded. Use form field "files"' });

    const userId = (req as any).user?.id;
    const uploadedMedia = [];

    for (const file of files) {
      const buffer: Buffer = file.buffer;
      const originalName: string = file.originalname;
      const mimeType = file.mimetype;

      const asset = await mediaService.saveBufferAsMedia(
        buffer,
        originalName,
        mimeType,
        userId
      );
      uploadedMedia.push(asset);
    }

    return res.status(201).json({ media: uploadedMedia });
  } catch (err: any) {
    console.error("uploadHandler error", err);
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Upload failed" });
  }
}

/**
 * GET /api/media/presign?filename=foo.jpg&contentType=image/jpeg
 * Returns presigned PUT URL (S3 only)
 */
export async function presignHandler(req: Request, res: Response) {
  try {
    const schema = z.object({
      filename: z.string().min(1),
      contentType: z.string().min(1),
      expires: z.number().optional(),
    });
    const parsed = schema.parse(req.query);
    const { filename, contentType, expires } = parsed;
    const r = await mediaService.createPresignedUploadUrl(
      filename,
      contentType,
      expires ?? 300
    );
    return res.json(r);
  } catch (err: any) {
    // Defensive: zod error shape can be .issues (recommended) or some tests might produce .errors
    if (err instanceof ZodError) {
      const issues =
        (err as any).errors ??
        (err as any).issues ??
        (Array.isArray((err as any).issues) ? (err as any).issues : []);
      return res.status(400).json({ message: "Invalid params", issues });
    }
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Presign failed" });
  }
}

/**
 * GET /api/media  (admin)
 */
export async function listMediaHandler(req: Request, res: Response) {
  try {
    const skip = Number(req.query.skip ?? 0);
    const limit = Math.min(200, Number(req.query.limit ?? 50));
    const items = await mediaService.listMedia(skip, limit);
    return res.json({ media: items, count: items.length });
  } catch (err: any) {
    return res.status(500).json({ message: "List failed" });
  }
}

/**
 * DELETE /api/media/:id  (admin)
 */
export async function deleteMediaHandler(req: Request, res: Response) {
  try {
    const id = req.params.id;
    await mediaService.deleteMediaAsset(id);
    return res.json({ ok: true });
  } catch (err: any) {
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Delete failed" });
  }
}
