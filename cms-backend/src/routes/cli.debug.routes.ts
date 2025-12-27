// src/routes/cli.debug.routes.ts
import { Router } from "express";
import authMiddleware, { requireRole } from "../middleware/auth";
import { execCommand } from "../services/cli.service";

const router = Router();

// POST /api/admin/cli/debug
// Body: { parsed: { action: 'create_page', payload: { path, title, layout } } }
// Protected: admin/editor
router.post("/", authMiddleware, requireRole("editor"), async (req, res) => {
  try {
    const parsed = req.body && req.body.parsed;
    if (!parsed)
      return res
        .status(400)
        .json({ message: "Missing parsed object in body: { parsed: {...} }" });
    const actorId = (req as any).user?.id;
    const result = await execCommand(parsed, actorId);
    return res.json({ ok: true, result });
  } catch (err: any) {
    console.error("CLI debug exec error:", err && (err.stack || err));
    return res
      .status(err.status ?? 400)
      .json({ message: err.message ?? "execCommand failed", details: err });
  }
});

export default router;
