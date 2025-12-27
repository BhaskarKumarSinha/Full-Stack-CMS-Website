import { Router } from "express";
import * as contactController from "../controllers/contact.controller";

const router = Router();

// Public route - submit contact form
router.post("/contact", contactController.submitContactForm);

export default router;
