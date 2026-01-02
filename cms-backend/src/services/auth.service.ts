/**
 * @file services/auth.service.ts
 * @description Authentication Service - User Authentication & Token Management
 *
 * This service provides:
 * - Password hashing with BCrypt (12 salt rounds)
 * - Password verification for login
 * - User creation with duplicate checking
 * - JWT token generation and verification
 *
 * @security
 * - BCrypt salt rounds: 12 (balance between security and performance)
 * - JWT tokens include user ID in 'sub' claim
 * - Token expiration configurable via JWT_EXPIRES_IN
 *
 * @usage
 * // Hash password before storing
 * const hash = await hashPassword('userPassword123');
 *
 * // Verify login credentials
 * const isValid = await verifyPassword(plainPassword, storedHash);
 *
 * // Generate JWT token
 * const token = generateAccessToken(userId);
 *
 * @best-practices
 * - Never log or expose password hashes
 * - Always use HTTPS in production
 * - Rotate JWT_SECRET periodically
 * - Use short token expiration with refresh tokens
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import UserModel, { IUser } from "../models/User";

/** BCrypt salt rounds - higher = more secure but slower */
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
