// src/tests/components.test.ts
import request from "supertest";
import app from "../index";
import ComponentModel from "../models/ComponentType";
import { createUserAndToken } from "./utils";

describe("Component registry (admin)", () => {
  it("lists components and includes newly created ones", async () => {
    const { token } = await createUserAndToken({ roles: ["superadmin"] });

    const comp = await (ComponentModel as any).create({
      type: "MyComp",
      displayName: "MyComp",
      propsSchema: {
        title: "string",
        items: { type: "array", items: "string" },
      },
    });

    const res = await request(app)
      .get("/api/admin/components")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const items = Array.isArray(res.body) ? res.body : res.body.items ?? [];
    const found = items.find(
      (c: any) => c.type === "MyComp" || c._id === (comp as any)._id?.toString()
    );
    expect(found).toBeTruthy();
    if (found) expect(found).toHaveProperty("propsSchema");
  });
});
