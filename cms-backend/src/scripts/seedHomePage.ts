import connectDB from "../db/mongoose";
import logger from "../utils/logger";
import { createPage } from "../services/page.service";

async function run() {
  try {
    await connectDB();
    const page = await createPage(
      {
        slug: "home",
        path: "/",
        title: "Homepage",
        status: "published",
        layout: [
          {
            type: "Hero",
            props: {
              headline: "Welcome to the Homepage",
              sub: "This is the root page.",
            },
          },
          {
            type: "TextBlock",
            props: { text: "<p>This homepage was seeded for testing.</p>" },
          },
        ],
      },
      undefined
    );
    logger.info("Seeded homepage: %o", page.path);
    process.exit(0);
  } catch (err) {
    logger.error("Seeding homepage failed", err);
    process.exit(1);
  }
}

run();
