// src/routes/admin.components.routes.ts
import { Router } from "express";
import {
  adminListComponents,
  adminCreateComponent,
} from "../controllers/component.controller";
import authMiddleware, { requireRole } from "../middleware/auth";
import { ensureJsonBody } from "../middleware/ensureBody";

const router = Router();

router.get(
  "/",
  authMiddleware,
  requireRole(["admin", "editor"]),
  adminListComponents
);
router.post(
  "/",
  authMiddleware,
  requireRole(["admin", "editor"]),
  ensureJsonBody,
  adminCreateComponent
);

export default router;
