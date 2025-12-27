import connectDB from "../db/mongoose";
import PageModel from "../models/Page";

async function run() {
  await connectDB();
  const pages = await PageModel.find({}).lean();
  for (const page of pages) {
    console.log(
      `Path: '${page.path}', Status: '${page.status}', Title: '${page.title}'`
    );
  }
  process.exit(0);
}

run();
