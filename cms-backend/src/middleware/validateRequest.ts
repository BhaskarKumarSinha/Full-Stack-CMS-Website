// src/middleware/validateRequest.ts
import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";

/**
 * Express middleware to validate req.body with Zod schema.
 * On failure returns 400 { message, issues: [...] }.
 * On success attaches parsed value to req.validatedBody.
 */
export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = (result.error as any).issues?.map((e: any) => {
        const path = e.path && e.path.length ? e.path.join(".") : "";
        return path ? `${path}: ${e.message}` : e.message;
      }) ??
        (result.error as any).errors?.map((e: any) => {
          const path = e.path && e.path.length ? e.path.join(".") : "";
          return path ? `${path}: ${e.message}` : e.message;
        }) ?? ["Invalid request body"];
      return res.status(400).json({ message: "Invalid request body", issues });
    }
    (req as any).validatedBody = result.data;
    return next();
  };
}
