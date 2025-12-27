import mongoose, { Document, Schema } from "mongoose";

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: Date;
  read: boolean;
}

const contactSubmissionSchema = new Schema<IContactSubmission>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export const ContactSubmissionModel = mongoose.model<IContactSubmission>(
  "ContactSubmission",
  contactSubmissionSchema
);
