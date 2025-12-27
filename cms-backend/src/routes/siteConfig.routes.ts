import { Router } from "express";
import {
  getSiteConfig,
  updateSiteConfig,
  renderFooter,
  refreshPublishedPages,
} from "../controllers/siteConfig.controller";

const router = Router();

router.get("/", getSiteConfig);
router.put("/", updateSiteConfig);
router.get("/render-footer", renderFooter);
router.post("/refresh-pages", refreshPublishedPages);

export default router;
