/**
 * @file middleware/auth.ts
 * @description Authentication and Authorization Middleware
 *
 * This middleware provides:
 * - JWT token verification for protected routes
 * - User session injection into request object
 * - Role-based access control via requireRole()
 *
 * @flow
 * 1. Extract Bearer token from Authorization header
 * 2. Verify token signature and expiration
 * 3. Load user from database
 * 4. Attach user info to request object
 * 5. Continue to next middleware/handler
 *
 * @usage
 * // Protect a route
 * router.get('/admin/pages', authMiddleware, handler);
 *
 * // Require specific role
 * router.post('/admin/users', authMiddleware, requireRole('admin'), handler);
 *
 * @security
 * - Tokens expire based on JWT_EXPIRES_IN config
 * - Invalid tokens return 401 Unauthorized
 * - Missing roles return 403 Forbidden
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import config from "../config";

/**
 * Auth middleware (default export)
 */
const authMiddleware: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return res.status(401).json({ message: "Missing token" });

  const secret = String(config.JWT_SECRET ?? "testsecret");
  let payload: any;
  try {
    payload = jwt.verify(token, secret) as any;
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const userId = payload?.sub ?? payload?.id ?? null;
  if (!userId)
    return res.status(401).json({ message: "Invalid token payload" });

  try {
    const user = await (UserModel as any).findById(userId).lean();
    if (!user) return res.status(401).json({ message: "User not found" });

    (req as any).user = (req as any).user ?? {};
    (req as any).user.id = user._id?.toString ? user._id.toString() : userId;
    (req as any).user.roles = user.role ? [user.role] : [];
    (req as any).user.email = user.email ?? undefined;

    return next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(500).json({ message: "Auth error" });
  }
};

/**
 * requireRole accepts a single role string or an array of role strings.
 * Example: requireRole('editor') or requireRole(['editor','admin'])
 */
export function requireRole(requiredRoles: string | string[]): RequestHandler {
  const rolesArray = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];
    const has = rolesArray.some((r) => userRoles.includes(r));
    if (!has)
      return res.status(403).json({ message: "Forbidden: insufficient role" });

    return next();
  };
}

export default authMiddleware;
