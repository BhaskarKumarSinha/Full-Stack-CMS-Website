/**
 * @file middleware/security.middleware.ts
 * @description Comprehensive Security Middleware Stack
 *
 * This module provides multiple layers of security protection:
 *
 * @features
 * 1. Helmet - Sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
 * 2. CORS - Controls cross-origin resource sharing
 * 3. Rate Limiting - Prevents brute force and DDoS attacks
 * 4. Speed Limiting - Progressive delay for excessive requests
 * 5. MongoDB Sanitization - Prevents NoSQL injection attacks
 *
 * @configuration
 * Rate limits are configurable via environment variables:
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 60000)
 * - RATE_LIMIT_MAX: Max requests per window (default: 200)
 * - RATE_LIMIT_STRICT: Strict limit for sensitive endpoints (default: 20)
 *
 * @usage
 * // Apply all security middleware
 * securityMiddleware().forEach(mw => app.use(mw));
 *
 * // Apply specific rate limiters
 * app.use('/api/auth', strictRateLimiter, authRoutes);
 *
 * @security
 * IMPORTANT: These settings should be reviewed and adjusted
 * based on your production environment and traffic patterns.
 */

import express, { RequestHandler } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import config from "../config";
import logger from "../utils/logger";

/**
 * cloneAndStripMongoKeys: deep-clones an object then removes keys starting with '$' or containing '.'.
 * Works safely for readonly / proxied request objects (we assign back only plain objects).
 */
function cloneAndStripMongoKeys<T = any>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  try {
    const copy = JSON.parse(JSON.stringify(obj));
    const strip = (o: any) => {
      if (!o || typeof o !== "object") return;
      for (const k of Object.keys(o)) {
        if (k.startsWith("$") || k.includes(".")) {
          delete o[k];
          continue;
        }
        strip(o[k]);
      }
    };
    strip(copy);
    return copy as T;
  } catch (err) {
    // if cloning fails, return original to avoid breaking request
    logger.warn("cloneAndStripMongoKeys failed: %o", err);
    return obj;
  }
}

/**
 * safeMongoSanitize middleware - uses clone-based sanitization and assigns back plain objects.
 * Avoids in-place mutation that can throw on getter-only props (supertest / certain environments).
 */
const safeMongoSanitize: RequestHandler = (req, _res, next) => {
  try {
    if ((req as any).body !== undefined) {
      (req as any).body = cloneAndStripMongoKeys((req as any).body);
    }
    // some frameworks provide req.query as getter-only - be defensive
    try {
      if ((req as any).query !== undefined) {
        (req as any).query = cloneAndStripMongoKeys((req as any).query);
      }
    } catch (e) {
      // silently ignore if assignment not allowed
      logger.debug(
        "Unable to assign req.query during sanitize (readonly): %o",
        e
      );
    }
    try {
      if ((req as any).params !== undefined) {
        (req as any).params = cloneAndStripMongoKeys((req as any).params);
      }
    } catch (e) {
      logger.debug(
        "Unable to assign req.params during sanitize (readonly): %o",
        e
      );
    }
  } catch (err) {
    logger.warn("safeMongoSanitize failed: %o", err);
  }
  return next();
};

// rate-limiter numeric safety
const RATE_WINDOW = Number(config.RATE_LIMIT_WINDOW_MS ?? 60000);
const RATE_MAX = Number(config.RATE_LIMIT_MAX ?? 200);
const RATE_STRICT = Number(config.RATE_LIMIT_STRICT ?? 20);

export const generalRateLimiter = rateLimit({
  windowMs: RATE_WINDOW,
  max: RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: RATE_WINDOW,
  max: RATE_STRICT,
  standardHeaders: true,
  legacyHeaders: false,
});

export const speedLimiter = slowDown({
  windowMs: RATE_WINDOW,
  delayAfter: Math.max(60, Math.floor(RATE_MAX / 2)),
  // per express-slow-down v2 API — provide function or constant; function avoids the v2 warning
  delayMs: () => 500,
});

export default function securityMiddleware(): RequestHandler[] {
  const middlewares: RequestHandler[] = [];

  middlewares.push(helmet() as unknown as RequestHandler);

  middlewares.push(
    cors({
      origin: config.FRONTEND_URL ?? true,
      credentials: true,
    }) as unknown as RequestHandler
  );

  // Use our safe clone-based sanitizer (no in-place mutation).
  middlewares.push(safeMongoSanitize);

  return middlewares;
}
