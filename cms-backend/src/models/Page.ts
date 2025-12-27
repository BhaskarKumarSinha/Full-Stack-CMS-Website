import mongoose, { Schema, Document } from "mongoose";

export type Block = {
  type: string;
  title?: string;
  props: Record<string, any>;
};

export interface IPage extends Document {
  slug: string;
  path: string;
  title?: string;
  status: "draft" | "published";
  layout: Block[];
  content?: string; // Store the full HTML content
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlockSchema = new Schema(
  {
    type: { type: String, required: true },
    title: { type: String },
    props: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const PageSchema = new Schema<IPage>(
  {
    slug: { type: String, required: true, index: true },
    path: { type: String, required: true, unique: true },
    title: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    layout: { type: [BlockSchema], default: [] },
    content: { type: String }, // Store the full HTML content
    seo: Schema.Types.Mixed,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    publishedAt: Date,
  },
  { timestamps: true }
);

// `path` is already declared `unique: true` on the field definition above.
// Avoid duplicate index declarations which cause mongoose warnings.

export default mongoose.model<IPage>("Page", PageSchema);
