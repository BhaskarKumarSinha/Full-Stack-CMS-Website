import mongoose, { Schema, Document } from "mongoose";

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
