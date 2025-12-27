import connectDB from "../db/mongoose";
import logger from "../utils/logger";
import { createPage } from "../services/page.service";

async function run() {
  try {
    await connectDB();
    const page = await createPage(
      {
        slug: "home",
        path: "/home",
        title: "Home (seeded)",
        status: "published",
        layout: [
          {
            type: "Hero",
            props: { headline: "Hello from seeded page", sub: "Seeded" },
          },
          {
            type: "TextBlock",
            props: { text: "<p>This is a seeded page for testing.</p>" },
          },
        ],
      },
      undefined
    );
    logger.info("Seeded page: %o", page.path);
    process.exit(0);
  } catch (err) {
    logger.error("Seeding page failed", err);
    process.exit(1);
  }
}

run();
