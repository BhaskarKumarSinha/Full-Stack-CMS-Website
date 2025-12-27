// src/controllers/component.controller.ts
import { Request, Response } from "express";
import * as componentService from "../services/component.service";
import { z, ZodError } from "zod";

/**
 * GET /api/admin/components
 */
export async function adminListComponents(req: Request, res: Response) {
  try {
    const items = await componentService.listComponents();
    return res.json({ items, count: items.length });
  } catch (err: any) {
    console.error("adminListComponents error", err);
    return res.status(500).json({ message: "Failed to list components" });
  }
}

/**
 * POST /api/admin/components
 */
export async function adminCreateComponent(req: Request, res: Response) {
  try {
    const schema = z.object({
      type: z.string().min(1),
      displayName: z.string().optional(),
      propsSchema: z.any().optional(),
      category: z.string().optional(),
      previewImage: z.string().optional(),
    });
    const parsed = schema.parse(req.body);

    // optional normalization (ensure propsSchema exists as object or null)
    const payload: any = {
      type: parsed.type,
      displayName: parsed.displayName,
      propsSchema: parsed.propsSchema ?? null,
      category: parsed.category,
      previewImage: parsed.previewImage,
    };

    const item = await componentService.createComponent(payload);
    return res.status(201).json(item);
  } catch (err: any) {
    if (err instanceof ZodError) {
      const issues =
        err.issues?.map((i) => {
          const path =
            Array.isArray(i.path) && i.path.length ? i.path.join(".") : "";
          return path ? `${path}: ${i.message}` : i.message;
        }) ?? [];
      return res.status(400).json({ message: "Invalid payload", issues });
    }
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Create failed" });
  }
}
