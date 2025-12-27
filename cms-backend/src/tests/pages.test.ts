// src/tests/pages.test.ts
import request from "supertest";
import app from "../index";
import { createUserAndToken } from "./utils";
import ComponentModel from "../models/ComponentType";
import PageModel from "../models/Page";

describe("Pages routes - publish & resolve", () => {
  it("publishes a page and then is resolvable via public API", async () => {
    const { token } = await createUserAndToken({ roles: ["superadmin"] });

    // Ensure TextBlock component exists (skip if already seeded)
    const existing = await ComponentModel.findOne({ type: "TextBlock" });
    if (!existing) {
      await (ComponentModel as any).create({
        type: "TextBlock",
        displayName: "TextBlock",
        propsSchema: { text: "string" },
      });
    }

    const parsed = {
      action: "create_page",
      payload: {
        path: "/test-publish",
        title: "To Publish",
        layout: [{ type: "TextBlock", props: { text: "<p>Publish me</p>" } }],
      },
      raw: "test-publish",
    };

    const createRes = await request(app)
      .post("/api/admin/cli-debug")
      .set("Authorization", `Bearer ${token}`)
      .send({ parsed })
      .expect(200);

    const pageId = createRes.body.result._id;
    expect(pageId).toBeTruthy();

    // publish (if your publish route differs, update path)
    await request(app)
      .post(`/api/admin/pages/${pageId}/publish`)
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(200);

    const resolveRes = await request(app)
      .get("/api/pages/resolve")
      .query({ path: "/test-publish" })
      .expect(200);

    expect(resolveRes.body).toHaveProperty("path", "/test-publish");
    expect(Array.isArray(resolveRes.body.layout)).toBe(true);
  });

  it("admin pages listing returns created pages", async () => {
    const { token } = await createUserAndToken({ roles: ["superadmin"] });

    const p = await (PageModel as any).create({
      slug: "list-test",
      path: "/list-test",
      title: "List Test",
      status: "draft",
      layout: [{ type: "TextBlock", props: { text: "<p>hi</p>" } }],
      createdBy: undefined,
    } as any);

    const res = await request(app)
      .get("/api/admin/pages")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const items = Array.isArray(res.body) ? res.body : res.body.items ?? [];
    const found = items.find((x: any) => x.path === "/list-test");
    expect(found).toBeDefined();
  });
});
