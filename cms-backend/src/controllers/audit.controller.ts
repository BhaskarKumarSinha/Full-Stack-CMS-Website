// src/controllers/audit.controller.ts
import { Request, Response } from "express";
import AuditModel from "../models/AuditLog";

/**
 * GET /api/admin/auditlogs?actor=&action=&success=&skip=&limit=
 */
export async function listAuditHandler(req: Request, res: Response) {
  try {
    const actor = req.query.actor as string | undefined;
    const action = req.query.action as string | undefined;
    const success =
      req.query.success !== undefined
        ? req.query.success === "true"
        : undefined;
    const skip = Number(req.query.skip ?? 0);
    const limit = Math.min(200, Number(req.query.limit ?? 50));

    const q: any = {};
    if (actor) q.actor = actor;
    if (action) q.action = action;
    if (success !== undefined) q.success = success;

    const items = await AuditModel.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const count = await AuditModel.countDocuments(q);
    return res.json({ items, count });
  } catch (err: any) {
    console.error("listAuditHandler", err);
    return res.status(500).json({ message: "Failed to list audit logs" });
  }
}
