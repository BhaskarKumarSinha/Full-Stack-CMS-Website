/**
 * @file db/mongoose.ts
 * @description MongoDB Database Connection Module
 *
 * This module handles:
 * - MongoDB connection establishment
 * - Connection error handling and logging
 * - Configuration validation
 *
 * @connection
 * Uses Mongoose ODM for MongoDB operations:
 * - Connection pooling (handled by Mongoose)
 * - Automatic reconnection
 * - Query buffering during connection
 *
 * @configuration
 * Set MONGODB_URI in environment or config:
 * - Local: mongodb://localhost:27017/cmsdb
 * - Atlas: mongodb+srv://user:pass@cluster.mongodb.net/cmsdb
 * - Docker: mongodb://mongo:27017/cms
 *
 * @usage
 * import connectDB from './db/mongoose';
 * await connectDB();  // Call once during app startup
 *
 * @error-handling
 * Throws error if:
 * - MONGODB_URI not configured
 * - Connection fails (network, auth, etc.)
 */

import mongoose from "mongoose";
import config from "../config";
import logger from "../utils/logger";

/**
 * Establishes connection to MongoDB database
 * Should be called once during application startup
 *
 * @throws Error if MONGODB_URI not set or connection fails
 * @returns Promise<void>
 */
export default async function connectDB() {
  const uri = config.MONGODB_URI ?? process.env.MONGODB_URI;

  // Validate MongoDB URI is configured
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
