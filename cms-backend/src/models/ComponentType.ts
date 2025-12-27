import mongoose, { Schema, Document } from "mongoose";

export interface IComponentType extends Document {
  type: string;
  displayName?: string;
  propsSchema?: any;
  category?: string;
  previewImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComponentTypeSchema = new Schema(
  {
    type: { type: String, required: true, unique: true },
    displayName: String,
    propsSchema: Schema.Types.Mixed,
    category: String,
    previewImage: String,
  },
  { timestamps: true }
);

export default mongoose.model<IComponentType>(
  "ComponentType",
  ComponentTypeSchema
);
