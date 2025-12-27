// scripts/seedComponents.ts
import mongoose from "mongoose";
import config from "../config";
import ComponentModel from "../models/ComponentType";

async function run() {
  if (!config.MONGODB_URI) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }
  await mongoose.connect(config.MONGODB_URI);
  const examples = [
    {
      type: "Hero",
      displayName: "Hero",
      propsSchema: {
        headline: "string",
        sub: "string",
        backgroundImage: "string",
      },
    },
    {
      type: "TextBlock",
      displayName: "Text Block",
      propsSchema: { text: "string" },
    },
    {
      type: "ImageGallery",
      displayName: "Image Gallery",
      propsSchema: { images: "array" },
    },
    {
      type: "ContactForm",
      displayName: "Contact Form",
      propsSchema: {
        email: "string",
        linkedin: "string",
        title: "string",
        subtitle: "string",
      },
    },
  ];
  for (const e of examples) {
    const exists = await ComponentModel.findOne({ type: e.type });
    if (!exists) {
      await new ComponentModel(e).save();
      console.log("Seeded component", e.type);
    }
  }
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
