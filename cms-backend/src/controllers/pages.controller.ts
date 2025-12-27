// src/controllers/pages.controller.ts
import { Request, Response } from "express";
import * as pageService from "../services/page.service";
import SiteConfig from "../models/SiteConfig";
import { z, ZodError } from "zod";
import logger from "../utils/logger";

/**
 * GET /api/pages/resolve?path=/about
 */
export async function resolveHandler(req: Request, res: Response) {
  const schema = z.object({ path: z.string().min(1) });
  const parsed = schema.parse(req.query);
  const path = parsed.path;
  const page = await pageService.getPageByPath(path, false);
  if (!page) return res.status(404).json({ message: "Page not found" });
  try {
    const siteCfg = await SiteConfig.findOne().lean();
    if (siteCfg) {
      // Merge site-level nav/footer into page seo.builderSchema if present
      page.seo = page.seo || {};
      page.seo.builderSchema = page.seo.builderSchema || {};
      // Only overwrite nav/footer when site config present (site-level source of truth)
      page.seo.builderSchema.navConfig =
        siteCfg.navConfig || page.seo.builderSchema.navConfig;
      page.seo.builderSchema.footerConfig =
        siteCfg.footerConfig || page.seo.builderSchema.footerConfig;
    }
  } catch (err) {
    // If SiteConfig read fails, proceed returning page as-is
    console.warn("Failed to load SiteConfig for resolveHandler:", err);
  }

  return res.json(page);
}

/* ----------------- Admin handlers ----------------- */

/**
 * POST /api/admin/pages
 */
export async function adminCreatePageHandler(req: Request, res: Response) {
  try {
    const createSchema = z.object({
      slug: z.string().min(1).optional(),
      path: z.string().min(1),
      title: z.string().optional(),
      status: z.enum(["draft", "published"]).optional(),
      published: z.boolean().optional(),
      content: z.string().optional(),
      layout: z.array(z.any()).optional(),
      seo: z.any().optional(),
    });
    const parsed = createSchema.parse(req.body);

    // Auto-generate slug from path if not provided
    const slug =
      parsed.slug ||
      parsed.path.replace(/^\//, "").replace(/\//g, "-") ||
      "default";

    // Auto-publish on creation - always set to published by default
    const status = "published";

    // Convert content (HTML string) to layout (Block array)
    const layout =
      parsed.layout ??
      (parsed.content
        ? [{ type: "html", props: { html: parsed.content } }]
        : []);

    // Build a payload object that matches the service expected type
    const payload = {
      slug,
      path: parsed.path,
      title: parsed.title,
      status,
      content: parsed.content, // Keep the original HTML content
      layout,
      seo: parsed.seo,
    } as const;

    const userId = (req as any).user?.id;
    const page = await pageService.createPage(payload as any, userId);
    return res.status(201).json(page);
  } catch (err: any) {
    if (err instanceof ZodError) {
      const issues =
        err.issues?.map((i) => {
          const path =
            Array.isArray(i.path) && i.path.length ? i.path.join(".") : "";
          return path ? `${path}: ${i.message}` : i.message;
        }) ?? [];
      return res.status(400).json({ message: "Validation failed", issues });
    }
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Create failed" });
  }
}

/**
 * PUT /api/admin/pages/:id
 */
export async function adminUpdatePageHandler(req: Request, res: Response) {
  try {
    const schema = z.object({
      slug: z.string().optional(),
      path: z.string().optional(),
      title: z.string().optional(),
      status: z.enum(["draft", "published"]).optional(),
      published: z.boolean().optional(),
      content: z.string().optional(),
      layout: z.array(z.any()).optional(),
      seo: z.any().optional(),
    });
    const parsed = schema.parse(req.body);

    // Build payload with guaranteed fields for service
    const payload: Record<string, any> = {
      // only include defined properties
      ...(parsed.slug !== undefined ? { slug: parsed.slug } : {}),
      ...(parsed.path !== undefined ? { path: parsed.path } : {}),
      ...(parsed.title !== undefined ? { title: parsed.title } : {}),
      ...(parsed.content !== undefined ? { content: parsed.content } : {}),
      seo: parsed.seo ?? undefined,
    };

    // Convert published boolean to status string
    if (parsed.published !== undefined) {
      payload.status = parsed.published ? "published" : "draft";
    } else if (parsed.status !== undefined) {
      payload.status = parsed.status;
    }

    // Preserve layout if explicitly provided, only auto-convert content if layout not provided
    if (parsed.layout !== undefined) {
      payload.layout = parsed.layout;
    } else if (parsed.content !== undefined) {
      payload.layout = [{ type: "html", props: { html: parsed.content } }];
    }

    const pageId = req.params.id;
    const userId = (req as any).user?.id;
    const page = await pageService.updatePage(pageId, payload, userId);
    return res.json(page);
  } catch (err: any) {
    if (err instanceof ZodError) {
      const issues =
        err.issues?.map((i) => {
          const path =
            Array.isArray(i.path) && i.path.length ? i.path.join(".") : "";
          return path ? `${path}: ${i.message}` : i.message;
        }) ?? [];
      return res.status(400).json({ message: "Validation failed", issues });
    }
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Update failed" });
  }
}

/**
 * POST /api/admin/pages/:id/publish
 */
export async function adminPublishPageHandler(req: Request, res: Response) {
  try {
    const pageId = req.params.id;
    const userId = (req as any).user?.id;
    const page = await pageService.publishPage(pageId, userId);
    return res.json(page);
  } catch (err: any) {
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Publish failed" });
  }
}

/**
 * DELETE /api/admin/pages/:id
 */
export async function adminDeletePageHandler(req: Request, res: Response) {
  try {
    const pageId = req.params.id;
    const result = await pageService.deletePage(pageId);
    return res.json(result);
  } catch (err: any) {
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Delete failed" });
  }
}

/**
 * GET /api/admin/pages
 */
export async function adminListPagesHandler(req: Request, res: Response) {
  try {
    const status = (req.query.status as string) || undefined;
    const skip = Number(req.query.skip ?? 0);
    const limit = Number(req.query.limit ?? 50);
    const pages = await pageService.listPages({ status, skip, limit });
    return res.json({ items: pages, count: pages.length });
  } catch (err: any) {
    return res.status(500).json({ message: "Failed to list pages" });
  }
}

/**
 * GET /api/admin/pages/:id
 */
export async function adminGetPageHandler(req: Request, res: Response) {
  try {
    const pageId = req.params.id;
    const page = await (await import("../models/Page")).default
      .findById(pageId)
      .lean();
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.json(page);
  } catch (err: any) {
    return res.status(500).json({ message: "Failed to get page" });
  }
}

/**
 * GET /api/admin/pages/:id/versions
 */
export async function adminListVersionsHandler(req: Request, res: Response) {
  try {
    const pageId = req.params.id;
    const skip = Number(req.query.skip ?? 0);
    const limit = Number(req.query.limit ?? 50);
    const versions = await pageService.listPageVersions(pageId, {
      skip,
      limit,
    });
    return res.json({ items: versions, count: versions.length });
  } catch (err: any) {
    return res.status(500).json({ message: "Failed to list versions" });
  }
}

/**
 * POST /api/admin/pages/:id/restore/:versionId
 */
export async function adminRestoreVersionHandler(req: Request, res: Response) {
  try {
    const pageId = req.params.id;
    const versionId = req.params.versionId;
    const userId = (req as any).user?.id;
    const page = await pageService.restorePageFromVersion(
      pageId,
      versionId,
      userId
    );
    return res.json(page);
  } catch (err: any) {
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Restore failed" });
  }
}
