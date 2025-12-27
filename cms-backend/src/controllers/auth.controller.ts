// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { z } from "zod";
import config from "../config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["admin", "editor", "viewer"]).optional(),
});

export async function loginHandler(req: Request, res: Response) {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await authService.findUserByEmail(parsed.email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await authService.verifyPassword(
      parsed.password,
      (user as any).passwordHash
    );
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const userId =
      (user as any)._id?.toString?.() ??
      (user as any).id ??
      String((user as any)._id);
    const token = authService.generateAccessToken(userId);

    // Do not send passwordHash
    const plain =
      typeof (user as any).toObject === "function"
        ? (user as any).toObject()
        : (user as any);
    if (plain && "passwordHash" in plain) delete (plain as any).passwordHash;

    return res.json({ token, user: plain });
  } catch (err: any) {
    console.error("loginHandler error:", err);
    return res
      .status(err?.status ?? 500)
      .json({ message: err?.message ?? "Login failed" });
  }
}

/**
 * Registration is gated by ALLOW_REGISTRATION env var.
 * In production you'd likely disable open registration and use invite flow.
 */
export async function registerHandler(req: Request, res: Response) {
  try {
    // defensive read of ALLOW_REGISTRATION
    const allow = String(
      (config as any).ALLOW_REGISTRATION ??
        process.env.ALLOW_REGISTRATION ??
        "false"
    );
    if (allow !== "true") {
      return res.status(403).json({ message: "Registration disabled" });
    }

    const parsed = registerSchema.parse(req.body);
    // ensure role not escalated by default
    const role = parsed.role ?? "editor";

    const user = await authService.createUser(
      parsed.email,
      parsed.password,
      role,
      parsed.name
    );

    const userId =
      (user as any)._id?.toString?.() ??
      (user as any).id ??
      String((user as any)._id);
    const token = authService.generateAccessToken(userId);

    const plain =
      typeof (user as any).toObject === "function"
        ? (user as any).toObject()
        : (user as any);
    if (plain && "passwordHash" in plain) delete (plain as any).passwordHash;

    return res.status(201).json({ token, user: plain });
  } catch (err: any) {
    console.error("registerHandler error:", err);
    return res
      .status(err?.status ?? 500)
      .json({ message: err?.message ?? "Registration failed" });
  }
}

/**
 * returns the currently logged in user; requires auth middleware
 */
export async function meHandler(req: Request, res: Response) {
  try {
    // auth middleware attaches req.user
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    // user is already a safe object set by middleware (id, roles, email)
    return res.json({ user });
  } catch (err: any) {
    console.error("meHandler error:", err);
    return res.status(500).json({ message: "Failed to fetch current user" });
  }
}
