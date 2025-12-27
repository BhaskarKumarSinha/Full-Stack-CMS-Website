// src/models/PageVersion.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPageVersion extends Document {
  pageId: mongoose.Types.ObjectId;
  versionNumber: number;
  snapshot: any;
  createdBy?: mongoose.Types.ObjectId;
  note?: string;
  createdAt: Date;
}

const PageVersionSchema = new Schema(
  {
    pageId: { type: Schema.Types.ObjectId, ref: "Page", required: true },
    versionNumber: { type: Number, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PageVersionSchema.index({ pageId: 1, versionNumber: -1 });

export default mongoose.model<IPageVersion>("PageVersion", PageVersionSchema);
