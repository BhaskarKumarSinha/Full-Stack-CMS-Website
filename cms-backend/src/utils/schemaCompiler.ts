// src/utils/schemaCompiler.ts
import { z, ZodTypeAny } from "zod";

/**
 * Deterministic compiler for propsSchema -> Zod schema.
 * - If propsSchema is an object describing keys -> returns ZodObject
 * - Supports primitive shorthand 'string', 'number', 'boolean', with optional '?'
 * - Supports arrays via { type: 'array', items: ... } or { items: ... } shorthand
 * - For top-level primitive schema, returns z.object({ value: <primitive> }) to keep consistency
 */

type RawSchema = any;

function compilePrimitiveNode(
  node: string | { type?: string; optional?: boolean; items?: any }
): ZodTypeAny {
  if (typeof node === "string") {
    const optional = node.endsWith("?");
    const base = optional ? node.slice(0, -1) : node;
    switch (base) {
      case "string":
        return optional ? z.string().optional() : z.string();
      case "number":
        return optional ? z.number().optional() : z.number();
      case "boolean":
        return optional ? z.boolean().optional() : z.boolean();
      case "any":
        return optional ? z.any().optional() : z.any();
      default:
        // unknown primitive -> accept any but keep optional flag
        return optional ? z.any().optional() : z.any();
    }
  }

  // object-literal describing type
  if (
    typeof node === "object" &&
    node !== null &&
    typeof node.type === "string"
  ) {
    const t = node.type;
    const optional = !!node.optional;
    switch (t) {
      case "string":
        return optional ? z.string().optional() : z.string();
      case "number":
        return optional ? z.number().optional() : z.number();
      case "boolean":
        return optional ? z.boolean().optional() : z.boolean();
      case "any":
        return optional ? z.any().optional() : z.any();
      case "array": {
        const items = (node as any).items ?? "any";
        const child = compileNode(items);
        return optional ? z.array(child).optional() : z.array(child);
      }
      default:
        return optional ? z.any().optional() : z.any();
    }
  }

  // fallback
  return z.any();
}

function compileNode(node: RawSchema): ZodTypeAny {
  if (node == null) return z.any();

  // If node is a string primitive or object with .type (handled above)
  if (typeof node === "string") {
    return compilePrimitiveNode(node);
  }

  if (Array.isArray(node)) {
    if (node.length === 0) return z.array(z.any());
    return z.array(compileNode(node[0]));
  }

  if (typeof node === "object") {
    // If provided as { items: ... } shorthand for array
    if ((node as any).items !== undefined) {
      return z.array(compileNode((node as any).items));
    }

    // Otherwise, treat as an object shape: each key -> child schema
    const shape: Record<string, ZodTypeAny> = {};
    for (const key of Object.keys(node)) {
      const val = (node as any)[key];
      if (
        typeof val === "string" ||
        (typeof val === "object" &&
          val &&
          typeof (val as any).type === "string")
      ) {
        shape[key] = compilePrimitiveNode(val);
      } else {
        shape[key] = compileNode(val);
      }
    }
    return z.object(shape);
  }

  // fallback
  return z.any();
}

/**
 * compilePropsSchema(propsSchema)
 * - if propsSchema is an object: returns z.object(...) compiled schema
 * - otherwise returns null
 */
export function compilePropsSchema(propsSchema: any): ZodTypeAny | null {
  if (
    !propsSchema ||
    typeof propsSchema !== "object" ||
    Array.isArray(propsSchema)
  )
    return null;
  try {
    const zschema = compileNode(propsSchema);
    // If top-level compiled schema is not an object, wrap into `z.object({ value: zschema })`
    if ((zschema as any)?._def?.typeName !== "ZodObject") {
      return z.object({ value: zschema });
    }
    return zschema;
  } catch (err) {
    // If compilation fails, return null (caller may skip strict validation)
    return null;
  }
}
