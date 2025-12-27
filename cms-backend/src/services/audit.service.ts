// src/services/audit.service.ts
import AuditModel from "../models/AuditLog";
import logger from "../utils/logger";

export async function createAuditEntry(args: {
  actor?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  command?: string;
  success?: boolean;
  details?: any;
}) {
  try {
    const doc = new AuditModel({
      actor: args.actor,
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      command: args.command,
      success: args.success ?? true,
      details: args.details,
    });
    await doc.save();
    return {
      id: doc._id.toString(),
      createdAt: doc.createdAt,
    };
  } catch (err) {
    logger.warn("Failed to create audit entry: %o", err);
    return null;
  }
}
