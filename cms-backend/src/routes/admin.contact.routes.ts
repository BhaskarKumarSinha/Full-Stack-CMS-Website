import { Router } from "express";
import * as contactController from "../controllers/contact.controller";

const router = Router();

// Admin routes - require authentication
router.get("/contact-submissions", contactController.getContactSubmissions);
router.patch("/contact-submissions/:id/read", contactController.markAsRead);
router.delete(
  "/contact-submissions/:id",
  contactController.deleteContactSubmission
);

export default router;
