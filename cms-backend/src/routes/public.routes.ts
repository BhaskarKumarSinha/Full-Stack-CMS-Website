import { Router } from "express";
import { resolveHandler } from "../controllers/pages.controller";

const router = Router();

// GET /api/pages/resolve?path=/about
router.get("/resolve", resolveHandler);

export default router;
