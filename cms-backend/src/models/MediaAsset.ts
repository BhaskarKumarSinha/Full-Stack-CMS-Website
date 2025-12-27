// src/models/MediaAsset.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMediaAsset extends Document {
  fileName: string;
  url: string;
  mimeType?: string;
  size?: number;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MediaAssetSchema = new Schema(
  {
    fileName: String,
    url: { type: String, required: true },
    mimeType: String,
    size: Number,
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);
