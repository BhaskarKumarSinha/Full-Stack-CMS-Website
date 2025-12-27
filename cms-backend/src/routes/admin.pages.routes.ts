// src/routes/admin.pages.routes.ts
import { Router } from "express";
import {
  adminCreatePageHandler,
  adminUpdatePageHandler,
  adminPublishPageHandler,
  adminDeletePageHandler,
  adminListPagesHandler,
  adminGetPageHandler,
  adminListVersionsHandler,
  adminRestoreVersionHandler,
} from "../controllers/pages.controller";

import authMiddleware, { requireRole } from "../middleware/auth";
import { ensureJsonBody } from "../middleware/ensureBody";

const router = Router();

// list pages
router.get(
  "/",
  authMiddleware,
  requireRole(["admin", "editor"]),
  adminListPagesHandler
);

// create page
router.post(
  "/",
  authMiddleware,
  requireRole(["admin", "editor"]),
  ensureJsonBody,
  adminCreatePageHandler
);

// get page by id
router.get(
  "/:id",
  authMiddleware,
  requireRole(["admin", "editor"]),
  adminGetPageHandler
);

// update page
router.put(
  "/:id",
  authMiddleware,
  requireRole(["admin", "editor"]),
  ensureJsonBody,
  adminUpdatePageHandler
);

// delete page
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["admin", "editor"]),
  adminDeletePageHandler
);

// publish
router.post(
  "/:id/publish",
  authMiddleware,
  requireRole(["admin", "editor"]),
  adminPublishPageHandler
);

// versions
router.get(
  "/:id/versions",
  authMiddleware,
  requireRole(["admin", "editor"]),
  adminListVersionsHandler
);
router.post(
  "/:id/restore/:versionId",
  authMiddleware,
  requireRole(["admin", "editor"]),
  adminRestoreVersionHandler
);

export default router;
