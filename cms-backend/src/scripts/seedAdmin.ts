/**
 * Run: npm run seed
 *
 * It will create a user with email and password read from env variables:
 * SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (recommended).
 * If not present, script will prompt values in console (simple).
 */

import connectDB from "../db/mongoose";
import config from "../config";
import { createUser } from "../services/auth.service";
import logger from "../utils/logger";

async function run() {
  try {
    await connectDB();
    const email = process.env.SEED_ADMIN_EMAIL || "admin@email.com";
    const pass = process.env.SEED_ADMIN_PASSWORD || "password1234";
    const existing = await (
      await import("../models/User")
    ).default.findOne({ email });
    if (existing) {
      logger.info("Admin already exists:", email);
      process.exit(0);
    }
    const user = await createUser(email, pass, "admin", "Super Admin");
    logger.info("Created superadmin:", user.email);
    logger.info("Use these credentials to login and get a token.");
    process.exit(0);
  } catch (err) {
    logger.error("Seeding failed", err);
    process.exit(1);
  }
}

run();
