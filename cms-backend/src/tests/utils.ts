// test/utils.ts
import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import config from "../config";

/**
 * Create a simple user and return { user, token }.
 * Writes to the test DB (in-memory).
 *
 * overrides can include: email, role, passwordHash, name, etc.
 */
export async function createUserAndToken(overrides: Partial<any> = {}) {
  const payload = {
    email: overrides.email ?? `test-${Date.now()}@example.com`,
    // NOTE: use `role` (string) — matches app expectations.
    role: overrides.role ?? "editor",
    passwordHash: overrides.passwordHash ?? "x", // not used in many tests
    name: overrides.name ?? "Test User",
    ...overrides,
  };

  // create user document (UserModel schema expects 'role' field)
  const user = await UserModel.create(payload);

  // create JWT signed with config.JWT_SECRET (guaranteed present by config defaults)
  const token = jwt.sign(
    { sub: user._id.toString() },
    config.JWT_SECRET as string,
    {
      expiresIn: "1h",
    }
  );

  return { user, token };
}
