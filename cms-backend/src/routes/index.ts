import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import publicRoutes from "./public.routes";
import mediaRoutes from "./media.routes";
import cliRoutes from "./cli.routes";
import contactRoutes from "./contact.routes";
import siteConfigRoutes from "./siteConfig.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/pages", publicRoutes);
router.use("/admin", adminRoutes);
router.use("/media", mediaRoutes);
router.use("/cli", cliRoutes);
router.use("/", contactRoutes); // Public contact form submission
// Site-level config (navigation/footer)
router.use("/site-config", siteConfigRoutes);

export default router;
