/**
 * @file models/User.ts
 * @description MongoDB schema for CMS Users
 *
 * This model handles user authentication and authorization:
 * - Email-based authentication
 * - BCrypt password hashing (12 rounds)
 * - Role-based access control (RBAC)
 *
 * @roles
 * - admin: Full system access, can manage users
 * - editor: Can create/edit/publish pages and media
 * - viewer: Read-only access to admin dashboard
 *
 * @security
 * - Passwords are never stored in plain text
 * - Email uniqueness enforced at database level
 * - Index on email for fast authentication lookups
 *
 * @example
 * const user = await UserModel.findOne({ email: 'admin@example.com' });
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * User role type definition
 * Used for role-based access control throughout the application
 */
export type Role = "admin" | "editor" | "viewer";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: Role;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "editor",
    },
    name: String,
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
