// src/routes/admin.routes.ts
import { Router } from "express";
import adminPagesRoutes from "./admin.pages.routes";
import adminComponentsRoutes from "./admin.components.routes";
import cliRoutes from "./cli.routes";
import cliDebugRoutes from "./cli.debug.routes";
import adminContactRoutes from "./admin.contact.routes";

const router = Router();

router.use("/pages", adminPagesRoutes);
router.use("/components", adminComponentsRoutes);
router.use("/cli", cliRoutes);
router.use("/cli-debug", cliDebugRoutes);
router.use("/", adminContactRoutes); // Admin contact submission management

// admin health
router.get("/health", (_, res) => res.json({ ok: true }));

export default router;
