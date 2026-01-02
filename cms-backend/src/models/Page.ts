/**
 * @file models/Page.ts
 * @description MongoDB schema for CMS Pages
 *
 * This model represents website pages with:
 * - Block-based layout system for visual page building
 * - SEO metadata for search engine optimization
 * - Custom CSS/HTML injection capabilities
 * - Version tracking for content history
 * - Draft/Published workflow states
 *
 * @schema
 * Pages use a flexible block-based layout where each block
 * has a type (hero, text, image, etc.) and props for configuration.
 *
 * @workflow
 * 1. Create page as "draft"
 * 2. Edit and preview changes
 * 3. Publish to make publicly accessible
 * 4. Each publish creates a version snapshot
 *
 * @relationships
 * - createdBy -> User (who created the page)
 * - updatedBy -> User (who last modified)
 *
 * @indexes
 * - slug: For URL-friendly lookups
 * - path: Unique constraint for routing
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Block type definition for page layout
 * Each block represents a section of the page
 * @property type - Block type identifier (hero, text, image, video, etc.)
 * @property title - Optional display title for the block
 * @property props - Block-specific configuration and content
 */
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
  customCss?: string; // Custom CSS added by user
  customHtml?: string; // Custom HTML added by user
  customHtmlPosition?:
    | "start"
    | "after-nav"
    | "before-footer"
    | "end"
    | "after-selector"; // Where to inject custom HTML
  customHtmlSelector?: string; // CSS selector for custom position
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
    customCss: { type: String, default: "" }, // Custom CSS added by user
    customHtml: { type: String, default: "" }, // Custom HTML added by user
    customHtmlPosition: {
      type: String,
      enum: ["start", "after-nav", "before-footer", "end", "after-selector"],
      default: "start",
    }, // Where to inject custom HTML
    customHtmlSelector: { type: String, default: "" }, // CSS selector for custom position
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
