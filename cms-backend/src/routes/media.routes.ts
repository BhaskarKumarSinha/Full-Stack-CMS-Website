// src/routes/media.routes.ts
import { Router } from "express";
import multer from "multer";
import {
  uploadHandler,
  presignHandler,
  listMediaHandler,
  deleteMediaHandler,
} from "../controllers/media.controller";
import authMiddleware, { requireRole } from "../middleware/auth";
import { ensureJsonBody } from "../middleware/ensureBody";

const router = Router();

// multer config depends on whether S3 is used:
// - For S3: use memoryStorage (we stream to S3)
// - For local: use memoryStorage too and service will write to disk (simple)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// Admin-protected uploads & management
router.post(
  "/upload",
  authMiddleware,
  requireRole(["editor", "admin"]),
  upload.array("files", 10),
  uploadHandler
);
router.get(
  "/presign",
  authMiddleware,
  requireRole(["editor", "admin"]),
  presignHandler
);
router.get(
  "/",
  authMiddleware,
  requireRole(["editor", "admin"]),
  listMediaHandler
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["editor", "admin"]),
  deleteMediaHandler
);

// Note: files are served statically by app.ts via /uploads/* in local mode or via S3 public URLs (stored in media docs)
export default router;
