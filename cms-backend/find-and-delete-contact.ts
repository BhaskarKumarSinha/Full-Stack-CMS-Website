import mongoose from "mongoose";
import PageModel from "./src/models/Page";
import config from "./src/config";

async function listPages() {
  try {
    await mongoose.connect(config.MONGODB_URI || "mongodb://localhost:27017");
    console.log("Connected to MongoDB");

    const pages = await PageModel.find();
    console.log("\nAll pages in database:");
    pages.forEach((page) => {
      console.log(`  - Path: ${page.path}, Title: ${page.title}`);
    });

    // Try to find contact page by various methods
    console.log("\n\nSearching for contact page...");
    const byPath = await PageModel.findOne({ path: "/contact" });
    console.log("By path /contact:", byPath ? "Found" : "Not found");

    const bySlug = await PageModel.findOne({ slug: "contact" });
    console.log("By slug 'contact':", bySlug ? "Found" : "Not found");

    const byTitle = await PageModel.findOne({
      title: /contact/i,
    });
    console.log(
      "By title containing 'contact':",
      byTitle ? "Found" : "Not found"
    );

    if (byPath) {
      console.log("\nDeleting page with path /contact...");
      await PageModel.deleteOne({ _id: byPath._id });
      console.log("✓ Deleted successfully");
    } else if (bySlug) {
      console.log("\nDeleting page with slug 'contact'...");
      await PageModel.deleteOne({ _id: bySlug._id });
      console.log("✓ Deleted successfully");
    } else if (byTitle) {
      console.log("\nDeleting page with contact in title...");
      await PageModel.deleteOne({ _id: byTitle._id });
      console.log("✓ Deleted successfully");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

listPages();
