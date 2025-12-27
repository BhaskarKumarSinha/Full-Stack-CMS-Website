// src/controllers/cli.controller.test.ts
import request from "supertest";
import app from "../index";
import mongoose from "mongoose";
import UserModel from "../models/User";
import jwt from "jsonwebtoken";
import config from "../config";

describe("Admin CLI endpoint (integration)", () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const user = await (UserModel as any).create({
      email: "admin@example.com",
      passwordHash: "x",
      roles: ["superadmin"],
    } as any);
    userId = (user as any)._id.toString();
    token = jwt.sign(
      { sub: userId, roles: user.roles ?? [] },
      String(config.JWT_SECRET ?? "testsecret"),
      {
        expiresIn: "1h",
      }
    );
  });

  afterAll(async () => {
    try {
      const db = mongoose.connection.db;
      if (db) await db.dropDatabase();
    } catch (e) {
      // ignore
    }
  });

  it("should create a page via parsed CLI debug (parsed payload route)", async () => {
    const parsed = {
      action: "create_page",
      payload: {
        path: "/test-page",
        title: "Test Page",
        layout: [{ type: "TextBlock", props: { text: "<p>Hi</p>" } }],
      },
      raw: "test",
    };

    const res = await request(app)
      .post("/api/admin/cli-debug")
      .set("Authorization", `Bearer ${token}`)
      .send({ parsed })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.result.path).toBe("/test-page");
    expect(res.body.result.title).toBe("Test Page");
  });
});
