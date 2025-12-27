// src/routes/admin.audit.routes.ts
import { Router } from "express";
import { listAuditHandler } from "../controllers/audit.controller";
import authMiddleware, { requireRole } from "../middleware/auth";

const router = Router();

// GET /api/admin/auditlogs
router.get("/", authMiddleware, requireRole("editor"), listAuditHandler);

export default router;
