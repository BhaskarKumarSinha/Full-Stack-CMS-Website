import mongoose from "mongoose";
import PageModel from "./src/models/Page";
import config from "./src/config";

async function deleteContactPage() {
  try {
    await mongoose.connect(config.MONGODB_URI || "mongodb://localhost:27017");
    console.log("Connected to MongoDB");

    const result = await PageModel.deleteOne({ path: "/contact" });
    console.log("Delete result:", result);

    if (result.deletedCount > 0) {
      console.log("✓ Contact page deleted successfully");
    } else {
      console.log("No contact page found to delete");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

deleteContactPage();
