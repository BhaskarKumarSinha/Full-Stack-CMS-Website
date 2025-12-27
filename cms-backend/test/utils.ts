// test/utils.ts
// Update path if your tests import from src/tests/utils.ts instead.

import jwt from "jsonwebtoken";
import UserModel from "../src/models/User";
import config from "../src/config";

/**
 * Create a test user and return { user, token }.
 * Default role is "admin" so tests that call admin routes will succeed.
 *
 * overrides: { email?, role?, passwordHash?, name?, ... }
 */
export async function createUserAndToken(overrides: Partial<any> = {}) {
  const payload = {
    email: overrides.email ?? `test-${Date.now()}@example.com`,
    // Use role (string) — matches application User schema.
    role: overrides.role ?? "admin",
    passwordHash: overrides.passwordHash ?? "x", // many tests don't use real password
    name: overrides.name ?? "Test User",
    ...overrides,
  };

  // Save user to test DB
  const user = await UserModel.create(payload);

  // Sign token. Ensure JWT_SECRET exists; config should provide sensible defaults in tests (.env.test)
  const secret = config.JWT_SECRET as string;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in config while creating test token");
  }

  // Include sub and role in token payload so middleware that checks claims can read role without DB
  const token = jwt.sign(
    { sub: user._id.toString(), role: payload.role },
    secret,
    {
      expiresIn: "1h",
    }
  );

  return { user, token };
}
