/**
 * Check all pages in the database
 * Run: npx ts-node src/scripts/checkPages.ts
 */

import connectDB from "../db/mongoose";
import logger from "../utils/logger";

async function run() {
  try {
    await connectDB();
    const PageModel = (await import("../models/Page")).default;
    const pages = await PageModel.find({}).lean();

    logger.info("Total pages in database: %d", pages.length);
    pages.forEach((page: any) => {
      logger.info(
        "- Path: %s | Status: %s | Title: %s | Blocks: %d",
        page.path,
        page.status,
        page.title || "(no title)",
        page.layout?.length || 0
      );
    });

    process.exit(0);
  } catch (err) {
    logger.error("Check failed", err);
    process.exit(1);
  }
}

run();
