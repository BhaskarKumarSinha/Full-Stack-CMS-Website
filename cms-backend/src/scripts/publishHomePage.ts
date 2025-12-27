import connectDB from "../db/mongoose";
import logger from "../utils/logger";
import PageModel from "../models/Page";
import { publishPage } from "../services/page.service";

async function run() {
  try {
    await connectDB();
    const page = await PageModel.findOne({ path: "/" });
    if (!page) throw new Error("No homepage found with path '/' in DB");
    if (page.status !== "published") {
      await publishPage(page._id.toString());
      logger.info("Homepage published: %o", page.path);
    } else {
      logger.info("Homepage already published: %o", page.path);
    }
    process.exit(0);
  } catch (err) {
    logger.error("Publishing homepage failed", err);
    process.exit(1);
  }
}

run();
