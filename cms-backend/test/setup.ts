// test/setup.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ComponentModel from "../src/models/ComponentType";

dotenv.config({ path: ".env.test" });

// increase Jest timeout globally for slow CI environments
jest.setTimeout(30000);

let mongo: MongoMemoryServer;

beforeAll(async () => {
  // create in-memory mongo without specifying storageEngine (deprecated)
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  process.env.MONGODB_URI = uri;
  // Force tests to not connect to real Redis (avoid background handles)
  process.env.REDIS_URL = "";
  // connect mongoose using the in-memory server URI
  await mongoose.connect(uri, { dbName: "jest" });

  // Seed test components
  const components = [
    {
      type: "Hero",
      displayName: "Hero",
      propsSchema: {
        headline: "string",
        sub: "string?",
        backgroundImage: "string?",
      },
    },
    {
      type: "TextBlock",
      displayName: "Text Block",
      propsSchema: { text: "string" },
    },
    {
      type: "ImageGallery",
      displayName: "Image Gallery",
      propsSchema: { images: { type: "array", items: "string" } },
    },
    {
      type: "Herobh123",
      displayName: "Hero BH",
      propsSchema: {
        headline: "string",
        sub: "string?",
        images: { type: "array", items: "string" },
      },
    },
  ];
  for (const comp of components) {
    const exists = await ComponentModel.findOne({ type: comp.type });
    if (!exists) {
      await ComponentModel.create(comp);
    }
  }
});

afterAll(async () => {
  // close mongoose connection and stop the in-memory server
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
    // eslint-disable-next-line no-console
    console.warn("Error disconnecting mongoose in afterAll:", e);
  }
  if (mongo) {
    await mongo.stop();
  }
});

afterEach(async () => {
  // clear DB between tests (defensive: mongoose.connection.db might be undefined)
  const db = mongoose.connection.db;
  if (!db) return;
  try {
    const collections = await db.collections();
    for (const coll of collections) {
      // skip internal system collections just in case
      if (coll.collectionName.startsWith("system.")) continue;
      await coll.deleteMany({});
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Error clearing test database in afterEach:", e);
  }
});
