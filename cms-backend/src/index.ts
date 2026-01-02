/**
 * @file index.ts
 * @description Main application entry point for the CMS Backend API
 *
 * This file is responsible for:
 * - Initializing Express application with all middleware
 * - Configuring security features (rate limiting, CORS, helmet)
 * - Setting up route handlers for different API endpoints
 * - Connecting to MongoDB database
 * - Starting the HTTP server
 *
 * @architecture
 * The application follows a layered architecture:
 * - Routes -> Controllers -> Services -> Models (Database)
 *
 * @security
 * Multiple security layers are applied:
 * - Helmet for HTTP headers
 * - CORS for cross-origin requests
 * - Rate limiting (general and strict)
 * - Audit logging for admin actions
 *
 * @author Bhaskar Kumar Sinha
 * @version 1.0.0
 */

import express from "express";
import morgan from "morgan";
import path from "path";
import securityMiddleware, {
  generalRateLimiter,
  strictRateLimiter,
} from "./middleware/security.middleware";
import { auditRequest } from "./middleware/auditRequest";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import publicRoutes from "./routes/public.routes";
import mediaRoutes from "./routes/media.routes";
import siteConfigRoutes from "./routes/siteConfig.routes";
import config from "./config";
import connectDB from "./db/mongoose";

// Initialize Express application
const app = express();

// logging (skip logging during test to avoid noisy output)
if (config.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

/**
 * Body Parsers Configuration
 * - JSON limit: 1MB to prevent payload attacks
 * - URL-encoded: Extended mode for nested objects
 * @security Limits prevent denial-of-service attacks via large payloads
 */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/**
 * Static File Serving for Local Uploads
 * Used when AWS S3 is not configured
 * Serves images from the /uploads directory
 * @note In production, consider using S3 or CDN for better performance
 */
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    index: false,
    extensions: ["jpg", "png", "webp", "gif", "jpeg"],
  })
);

/**
 * Security Middleware Stack
 * Includes: Helmet, CORS, HPP, and custom MongoDB sanitization
 * @see middleware/security.middleware.ts for detailed implementation
 */
securityMiddleware().forEach((mw) => app.use(mw));

/**
 * Rate Limiting Configuration
 * - General: 200 requests/minute for public endpoints
 * - Strict: 20 requests/minute for auth and admin endpoints
 * @security Prevents brute force and DDoS attacks
 */
app.use("/api", generalRateLimiter);

/**
 * Authentication Routes
 * Handles: Login, registration, token refresh
 * @security Strict rate limiting to prevent credential stuffing
 */
app.use("/api/auth", strictRateLimiter, authRoutes);

/**
 * Admin Routes
 * Protected routes for content management
 * @security Strict rate limiting + audit logging for compliance
 * @requires Authentication via JWT Bearer token
 */
app.use("/api/admin", strictRateLimiter, auditRequest, adminRoutes);

/**
 * Media Management Routes
 * Handles: Upload, delete, list media assets
 * @security Requires admin/editor role
 */
app.use("/api/media", strictRateLimiter, auditRequest, mediaRoutes);

/**
 * Public Page Routes
 * Serves published pages to visitors
 * @note No authentication required
 */
app.use("/api/pages", publicRoutes);

/**
 * Site Configuration Routes
 * Manages: Navigation, footer, global settings
 */
app.use("/api/site-config", siteConfigRoutes);

/**
 * Health Check Endpoint
 * Used by load balancers and monitoring tools
 * @returns {object} { ok: true } if server is healthy
 */
app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * Global Error Handler
 * Catches all unhandled errors and returns appropriate response
 * @security Never exposes stack traces in production
 */
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err && err.stack ? err.stack : err);
    const status = err?.status ?? 500;
    const message = err?.message ?? "Internal server error";
    const details = err?.details ?? undefined;
    const payload: any = { message };
    if (details) payload.details = details;
    res.status(status).json(payload);
  }
);

// Only start server when NOT in test mode; ensure DB is connected first
if (config.NODE_ENV !== "test") {
  (async () => {
    try {
      await connectDB();
      const port = Number(config.PORT || 4000);
      app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
      });
    } catch (err) {
      console.error("Failed to start server due to DB connection error", err);
      process.exit(1);
    }
  })();
}

// Export app for Jest / Supertest
export default app;
