// src/middleware/auditRequest.ts
import { RequestHandler } from "express";
import { createAuditEntry } from "../services/audit.service"; // ensure you have this service

export const auditRequest: RequestHandler = async (req, res, next) => {
  try {
    const actor = (req as any).user?.id;
    const path = req.originalUrl;
    const method = req.method;
    // Only log admin area
    if (path.startsWith("/api/admin")) {
      await createAuditEntry({
        actor,
        action: "request",
        resourceType: "admin_request",
        resourceId: undefined,
        command: `${method} ${path}`,
        success: true,
        details: {
          body: req.body
            ? Object.keys(req.body).length
              ? "[redacted]"
              : {}
            : {},
        },
      });
    }
  } catch (e) {
    console.warn("auditRequest middleware error", e);
  }
  next();
};
