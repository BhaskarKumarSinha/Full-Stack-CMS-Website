// src/index.ts
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

const app = express();

// logging (skip logging during test to avoid noisy output)
if (config.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// body parsers with limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// serve local uploads (when not using S3)
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    index: false,
    extensions: ["jpg", "png", "webp", "gif", "jpeg"],
  })
);

// mount security middleware (array)
securityMiddleware().forEach((mw) => app.use(mw));

// global rate limiter for /api
app.use("/api", generalRateLimiter);

// mount auth with stricter limits
app.use("/api/auth", strictRateLimiter, authRoutes);

// mount admin routes: apply strict limiter + audit
app.use("/api/admin", strictRateLimiter, auditRequest, adminRoutes);

// media management (admin/editor role enforced in route middleware)
app.use("/api/media", strictRateLimiter, auditRequest, mediaRoutes);

// public page routes
app.use("/api/pages", publicRoutes);
// Site-level config (navigation/footer)
app.use("/api/site-config", siteConfigRoutes);

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

// global error handler
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
