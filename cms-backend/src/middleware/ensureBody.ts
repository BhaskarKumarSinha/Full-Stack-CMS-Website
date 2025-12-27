import { Request, Response, NextFunction } from "express";

/**
 * ensureJsonBody middleware
 * - Checks that request has a JSON body (useful for POST/PUT endpoints).
 * - If Content-Type is application/json, or if req.body is already parsed,
 *   it allows the request to continue.
 * - Otherwise returns 400 with a helpful message.
 *
 * This is intentionally lightweight — express.json() should already be registered
 * in app.ts. This middleware is a helpful extra guard to surface missing headers.
 */
export function ensureJsonBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If express.json() parsed a body, req.body will be defined (object or array).
  if (req.body && typeof req.body === "object") {
    return next();
  }

  // If Content-Type header explicitly says JSON, but body wasn't parsed, return helpful error
  const contentType = (req.headers["content-type"] || "").toString();
  if (contentType.includes("application/json")) {
    return res.status(400).json({
      message:
        "Invalid or empty JSON body. Make sure the request contains valid JSON and the header Content-Type: application/json is set.",
    });
  }

  // If no JSON header and no body, also complain (we require JSON for these endpoints)
  return res.status(400).json({
    message:
      "Missing JSON body. Please set the header Content-Type: application/json and include a valid JSON payload.",
  });
}
