import { Router } from "express";
import {
  loginHandler,
  registerHandler,
  meHandler,
} from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth";
const router = Router();

router.post("/login", loginHandler);
router.post("/register", registerHandler); // gated via ALLOW_REGISTRATION
router.get("/me", authMiddleware, meHandler);

export default router;
