// src/tests/cli.test.ts
import request from "supertest";
import app from "../index";
import { createUserAndToken } from "./utils";
import ComponentModel from "../models/ComponentType";

describe("CLI Exec (parsed debug) - integration", () => {
  it("creates a page via parsed CLI debug endpoint", async () => {
    const { token } = await createUserAndToken({ roles: ["superadmin"] });

    // Create or skip component if it already exists
    const existing = await ComponentModel.findOne({ type: "Herobh123" });
    if (!existing) {
      await (ComponentModel as any).create({
        type: "Herobh123",
        displayName: "Hero",
        propsSchema: {
          headline: "string",
          sub: "string?",
          images: { type: "array", items: "string" },
        },
      });
    }

    const parsed = {
      action: "create_page",
      payload: {
        path: "/services",
        title: "Services",
        layout: [
          {
            type: "Herobh123",
            props: {
              headline: "Our Services",
              sub: "We deliver quality",
              images: ["/uploads/bg.jpg"],
            },
          },
          {
            type: "TextBlock",
            props: { text: "<p>Hello</p>" },
          },
        ],
      },
      raw: "test-run",
    };

    const res = await request(app)
      .post("/api/admin/cli-debug")
      .set("Authorization", `Bearer ${token}`)
      .send({ parsed })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.result).toHaveProperty("path", "/services");
    expect(res.body.result).toHaveProperty("layout");
    const hero = (res.body.result.layout || []).find(
      (b: any) => b.type === "Herobh123"
    );
    expect(hero).toBeTruthy();
    expect(hero.props).toMatchObject({ headline: "Our Services" });
  });
});
