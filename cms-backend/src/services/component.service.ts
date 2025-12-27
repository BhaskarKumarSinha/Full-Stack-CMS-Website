// src/services/component.service.ts
import ComponentModel, { IComponentType } from "../models/ComponentType";

/**
 * List all component types
 */
export async function listComponents() {
  const comps = await ComponentModel.find().sort({ createdAt: 1 }).lean();
  return comps.map((c: any) => ({
    id: c._id.toString(),
    type: c.type,
    displayName: c.displayName,
    propsSchema: c.propsSchema,
    category: c.category,
    previewImage: c.previewImage,
    createdAt: c.createdAt,
  }));
}

/**
 * Create a new component type (admin)
 */
export async function createComponent(payload: {
  type: string;
  displayName?: string;
  propsSchema?: any;
  category?: string;
  previewImage?: string;
}) {
  const existing = await ComponentModel.findOne({ type: payload.type });
  if (existing) throw { status: 400, message: "Component type already exists" };

  const doc = new ComponentModel({
    type: payload.type,
    displayName: payload.displayName,
    propsSchema: payload.propsSchema,
    category: payload.category,
    previewImage: payload.previewImage,
  });
  await doc.save();
  return {
    id: doc._id.toString(),
    type: doc.type,
    displayName: doc.displayName,
    propsSchema: doc.propsSchema,
    category: doc.category,
    previewImage: doc.previewImage,
    createdAt: doc.createdAt,
  };
}

/**
 * Get a component type by name
 */
export async function getComponentByType(type: string) {
  return ComponentModel.findOne({ type }).lean();
}
