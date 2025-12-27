import mongoose, { Schema, Document } from "mongoose";

export interface ISiteConfig extends Document {
  navConfig: {
    brandName: string;
    logoUrl?: string;
    navItems: any[];
  };
  footerConfig: {
    companyName: string;
    description?: string;
    footerLinks: string[];
    // New: structured footer sections (columns) with heading + links
    footerSections?: {
      heading?: string;
      links?: { label?: string; href?: string }[];
    }[];
  };
  updatedAt: Date;
}

const SiteConfigSchema = new Schema<ISiteConfig>({
  navConfig: {
    brandName: { type: String, required: true },
    logoUrl: { type: String },
    navItems: { type: [Schema.Types.Mixed], default: [] },
    // Allow storing navigation style settings (colors, underline, etc.)
    navStyle: { type: Schema.Types.Mixed, default: {} },
  },
  footerConfig: {
    companyName: { type: String, required: true },
    description: { type: String },
    footerLinks: { type: [String], default: [] },
    footerSections: {
      type: [
        {
          heading: { type: String },
          links: { type: [Schema.Types.Mixed], default: [] },
        },
      ],
      default: [],
    },
    // Allow storing footer style settings (colors, hover, underline) similar to nav
    footerStyle: { type: Schema.Types.Mixed, default: {} },
  },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);
