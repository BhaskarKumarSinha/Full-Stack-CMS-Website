// scripts/fixMediaUrl.ts
import mongoose from "mongoose";
import config from "../config";
import MediaModel from "../models/MediaAsset";

async function run() {
  const uri = config.MONGODB_URI;
  if (!uri) {
    console.error(
      "MONGODB_URI is not set. Please set it in your .env before running this script."
    );
    process.exit(1);
  }

  await mongoose.connect(uri);
  const id = "692daf1618de171a3ae35e7f"; // replace with your media _id if different
  const media = await MediaModel.findById(id);
  if (!media) {
    console.log("Media not found for id", id);
    await mongoose.disconnect();
    process.exit(1);
  }
  const filename = media.fileName;
  const newUrl = `http://localhost:${
    config.PORT || 4000
  }/uploads/${encodeURIComponent(filename)}`;
  media.url = newUrl;
  await media.save();
  console.log("Updated media url ->", newUrl);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
