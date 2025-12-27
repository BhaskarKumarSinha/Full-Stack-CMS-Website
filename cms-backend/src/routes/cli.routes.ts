// src/routes/cli.routes.ts
import { Router } from "express";
import { adminCliHandler } from "../controllers/cli.controller";
import authMiddleware, { requireRole } from "../middleware/auth";
import { ensureJsonBody } from "../middleware/ensureBody";

const router = Router();

// POST /api/cli -> execute CLI-like admin commands
router.post(
  "/",
  authMiddleware,
  requireRole("editor"),
  ensureJsonBody,
  adminCliHandler
);

export default router;
