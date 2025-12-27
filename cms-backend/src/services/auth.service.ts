// src/services/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import UserModel, { IUser } from "../models/User";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function createUser(
  email: string,
  password: string,
  role: IUser["role"] = "editor",
  name?: string
) {
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error("Email already in use");
  const passwordHash = await hashPassword(password);
  const u = new UserModel({ email, passwordHash, role, name });
  await u.save();
  return u;
}

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

/**
 * Generate JWT access token for the given user id.
 * Coerce & validate JWT_SECRET at runtime to satisfy typings.
 */
export function generateAccessToken(userId: string) {
  const payload = { sub: userId };

  const secretVal = config.JWT_SECRET ?? process.env.JWT_SECRET;
  const secret =
    typeof secretVal === "string" ? secretVal : String(secretVal ?? "");
  if (!secret) throw new Error("JWT_SECRET not configured");

  // ensure expiresIn matches jwt.SignOptions['expiresIn'] type
  const expiresIn: jwt.SignOptions["expiresIn"] = (config.JWT_EXPIRES_IN ??
    "1h") as jwt.SignOptions["expiresIn"];

  const options: jwt.SignOptions = {
    expiresIn,
  };

  const token = jwt.sign(payload as any, secret as jwt.Secret, options);
  return token;
}

/**
 * Verify JWT token and return payload (throws on invalid/expired).
 */
export function verifyAccessToken(token: string) {
  try {
    const secretVal = config.JWT_SECRET ?? process.env.JWT_SECRET;
    const secret =
      typeof secretVal === "string" ? secretVal : String(secretVal ?? "");
    if (!secret) throw new Error("JWT_SECRET not configured");
    const payload = jwt.verify(token, secret as jwt.Secret) as any;
    return payload;
  } catch (err) {
    throw err;
  }
}
