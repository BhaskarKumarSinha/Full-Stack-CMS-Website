// src/db/mongoose.ts
import mongoose from "mongoose";
import config from "../config";
import logger from "../utils/logger";

export default async function connectDB() {
  const uri = config.MONGODB_URI ?? process.env.MONGODB_URI;
  if (!uri || typeof uri !== "string" || uri.trim() === "") {
    const err = new Error(
      "MONGODB_URI not set. Please configure it in env or config."
    );
    logger.error(err);
    throw err;
  }
  try {
    await mongoose.connect(uri);
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error("MongoDB connection error", err);
    throw err;
  }
}
