// src/models/AuditLog.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  actor?: mongoose.Types.ObjectId | string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  command?: string;
  success: boolean;
  details?: any;
  createdAt: Date;
}

const AuditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    resourceType: String,
    resourceId: String,
    command: String,
    success: { type: Boolean, default: true },
    details: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
