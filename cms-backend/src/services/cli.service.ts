// src/services/cli.service.ts
import * as pageService from "./page.service";
import * as componentService from "./component.service";
import * as contactService from "./contact.service";
import PageModel from "../models/Page";
import logger from "../utils/logger";
import { createAuditEntry } from "./audit.service";
import { compilePropsSchema } from "../utils/schemaCompiler";
import { ZodError } from "zod";

/**
 * Helper: deterministic validation using compiled Zod schema.
 * - Runs zschema.safeParse(candidate)
 * - Formats Zod errors into a friendly message and throws {status, message}
 * - Returns parsed data on success.
 */
function validateCandidateProps(
  zschema: any,
  candidate: any,
  blockType: string,
  index: number
) {
  // attempt 1: raw candidate
  let res: any = undefined;
  try {
    res = (zschema as any).safeParse?.(candidate);
  } catch (err) {
    console.warn(
      "[CLI] zod.safeParse threw on raw candidate for block %d (%s): %o",
      index,
      blockType,
      err
    );
    res = undefined;
  }

  // If raw fails, attempt wrapper attempt { value: candidate }
  if (!res || !res.success) {
    // try wrapper only if the first attempt produced a ZodError that mentions "value"
    let shouldTryWrapper = false;
    if (res && res.error && Array.isArray((res.error as any).errors)) {
      try {
        const paths = (res.error as any).errors.map((e: any) =>
          Array.isArray(e.path) && e.path.length ? e.path[0] : null
        );
        if (paths.includes("value")) shouldTryWrapper = true;
      } catch (e) {
        // if we cannot detect paths, still allow wrapper retry as last-ditch
        shouldTryWrapper = true;
      }
    } else {
      // if we didn't get a shaped error, still try wrapper once
      shouldTryWrapper = true;
    }

    if (shouldTryWrapper) {
      try {
        console.debug(
          "[CLI] retrying validation with wrapper { value: candidate } for block %d (%s)",
          index,
          blockType
        );
        res = (zschema as any).safeParse?.({ value: candidate });
      } catch (err) {
        console.warn(
          "[CLI] zod.safeParse threw on wrapper for block %d (%s): %o",
          index,
          blockType,
          err
        );
        res = undefined;
      }
    }
  }

  // If still failing, format friendly issues and include full zod error summary in details for debugging
  if (!res || !res.success) {
    // format friendly issues array
    let issues: string[] = ["Invalid props"];
    if (res && res.error && Array.isArray((res.error as any).errors)) {
      try {
        issues = (res.error as any).errors.map((e: any) => {
          const p =
            Array.isArray(e.path) && e.path.length ? e.path.join(".") : "";
          return p ? `${p}: ${e.message}` : e.message;
        });
      } catch (formatErr: unknown) {
        // Defensive formatting for unknown error shapes
        try {
          if (
            typeof formatErr === "object" &&
            formatErr !== null &&
            "message" in formatErr
          ) {
            issues = [String((formatErr as any).message)];
          } else {
            issues = [String(formatErr ?? "Unknown formatting error")];
          }
        } catch {
          issues = ["Invalid props (error formatting failed)"];
        }
      }
    } else if (res && (res as any).error) {
      try {
        issues = [JSON.stringify((res as any).error).slice(0, 300)];
      } catch {
        issues = ["Invalid props (unknown error)"];
      }
    } else {
      // no zod error object available — include candidate inspection
      issues = [
        `Invalid props (no zod error). candidate type: ${typeof candidate}`,
      ];
    }

    // full zod object for server logs (very useful)
    try {
      console.error(
        "[CLI] FULL ZOD ERROR for block %d (%s): %o",
        index,
        blockType,
        res?.error ?? "no res.error"
      );
    } catch (logErr) {
      console.error(
        "[CLI] could not stringify zod error for block %d (%s)",
        index,
        blockType
      );
    }

    // throw structured error (controller returns message; details can be returned to client if you want)
    const message = `Invalid props for component ${blockType} at index ${index}: ${issues.join(
      "; "
    )}`;
    const errObj: any = { status: 400, message };
    // attach 'details' for debugging clients (optional)
    errObj.details = {
      zod: res?.error
        ? JSON.parse(
            JSON.stringify(res.error, Object.getOwnPropertyNames(res.error))
          )
        : null,
    };
    throw errObj;
  }

  // success — return parsed data
  return (res as any).data;
}

/**
 * parseCommand: recognizes CLI strings and returns a parsed descriptor.
 * Supports:
 *  - create page <path> title="..." components=<JSON array>
 *  - publish page <path|id>
 *  - delete page <path|id>
 *  - create component <type> displayName="..." propsSchema=<JSON object>
 */
export function parseCommand(command: string) {
  const raw = (command || "").trim();
  const lower = raw.toLowerCase();

  if (lower.startsWith("create page ")) {
    const after = raw.slice("create page ".length).trim();
    const firstSpace = after.indexOf(" ");
    let pathToken = "";
    let rest = "";
    if (firstSpace === -1) {
      pathToken = after;
      rest = "";
    } else {
      pathToken = after.slice(0, firstSpace);
      rest = after.slice(firstSpace + 1).trim();
    }

    // title
    let title: string | undefined;
    const titleMatch = rest.match(/title=(?:'([^']*)'|"([^"]*)"|([^\s]+))/i);
    if (titleMatch) title = titleMatch[1] ?? titleMatch[2] ?? titleMatch[3];

    // components JSON
    let layout: any[] = [];
    const compMatch = rest.match(/components=(.*)$/i);
    if (compMatch && compMatch[1]) {
      try {
        const cleaned = compMatch[1].trim().replace(/;$/, "").trim();
        layout = JSON.parse(cleaned);
        if (!Array.isArray(layout))
          throw new Error("components must be a JSON array");
      } catch (err: any) {
        throw {
          status: 400,
          message: "Failed to parse components JSON: " + (err.message || err),
        };
      }
    }

    return {
      action: "create_page",
      payload: { path: pathToken, title, layout },
      raw,
    };
  }

  if (lower.startsWith("publish page ")) {
    const after = raw.slice("publish page ".length).trim();
    const target = after.split(/\s+/)[0];
    if (!target)
      throw { status: 400, message: "publish page requires a path or id" };
    return { action: "publish_page", payload: { target }, raw };
  }

  if (lower.startsWith("delete page ")) {
    const after = raw.slice("delete page ".length).trim();
    const target = after.split(/\s+/)[0];
    if (!target)
      throw { status: 400, message: "delete page requires a path or id" };
    return { action: "delete_page", payload: { target }, raw };
  }

  if (lower.startsWith("create component ")) {
    const after = raw.slice("create component ".length).trim();
    const firstSpace = after.indexOf(" ");
    const typeToken = firstSpace === -1 ? after : after.slice(0, firstSpace);
    const rest = firstSpace === -1 ? "" : after.slice(firstSpace + 1).trim();

    let displayName: string | undefined;
    const displayMatch = rest.match(
      /displayName=(?:'([^']*)'|"([^"]*)"|([^\s]+))/i
    );
    if (displayMatch)
      displayName = displayMatch[1] ?? displayMatch[2] ?? displayMatch[3];

    let propsSchema: any = undefined;
    const schemaMatch = rest.match(/propsSchema=(.*)$/i);
    if (schemaMatch && schemaMatch[1]) {
      try {
        const cleaned = schemaMatch[1].trim().replace(/;$/, "").trim();
        propsSchema = JSON.parse(cleaned);
        if (typeof propsSchema !== "object" || Array.isArray(propsSchema)) {
          throw new Error("propsSchema must be a JSON object");
        }
      } catch (err: any) {
        throw {
          status: 400,
          message: "Failed to parse propsSchema JSON: " + (err.message || err),
        };
      }
    }

    return {
      action: "create_component",
      payload: { type: typeToken, displayName, propsSchema },
      raw,
    };
  }

  throw { status: 400, message: "Unsupported CLI command" };
}

/**
 * execCommand executes parsed CLI commands and audits them.
 */
export async function execCommand(parsed: any, actorId?: string) {
  const action = parsed?.action;
  const raw = parsed?.raw ?? String(parsed);

  // debug: log the parsed command at the start
  console.debug(
    "[CLI] execCommand called. action=%s actor=%s raw=%s",
    action,
    actorId,
    raw
  );
  console.debug("[CLI] parsed object:", JSON.stringify(parsed, null, 2));

  try {
    // ---------- CREATE PAGE ----------
    if (action === "create_page") {
      const { path, title } = parsed.payload ?? {};
      let layout = parsed.payload?.layout ?? [];

      if (!Array.isArray(layout)) {
        throw {
          status: 400,
          message:
            "Invalid CLI: components must be a JSON array (components=[...])",
        };
      }

      console.debug("[CLI] create_page layout length=%d", layout.length);

      for (let i = 0; i < layout.length; i++) {
        const block = layout[i];
        console.debug("[CLI] validating block index=%d raw=%o", i, block);

        if (!block || typeof block !== "object") {
          throw {
            status: 400,
            message: `Layout item ${i} is invalid (must be object)`,
          };
        }
        if (!block.type) {
          throw {
            status: 400,
            message: `Layout item ${i} missing required 'type' field`,
          };
        }

        // ensure props exists
        if (block.props === undefined || block.props === null) {
          (block as any).props = {};
        }

        // fetch component definition
        const comp = await componentService.getComponentByType(block.type);
        if (!comp) {
          throw {
            status: 400,
            message: `Unknown component type: ${block.type} (block index ${i})`,
          };
        }
        console.debug(
          "[CLI] component fetched:",
          comp.type,
          "propsSchema=",
          comp.propsSchema
        );

        // alias: backgroundImage -> images if schema expects images array
        try {
          const schemaObj = comp.propsSchema;
          if (schemaObj && typeof schemaObj === "object") {
            // safer detection for images array node
            const imgNode = (schemaObj as any).images;
            const expectsImages =
              !!imgNode &&
              (imgNode === "string" ||
                (typeof imgNode === "object" &&
                  (imgNode.type === "array" || imgNode.items !== undefined)));

            if (expectsImages) {
              const p = (block as any).props;
              if (p && p.backgroundImage && !p.images) {
                if (typeof p.backgroundImage === "string") {
                  p.images = [p.backgroundImage];
                } else if (Array.isArray(p.backgroundImage)) {
                  p.images = p.backgroundImage;
                }
                console.debug(
                  "[CLI] alias applied: backgroundImage -> images for block index=%d",
                  i
                );
              }
            }
          }
        } catch (aliasErr) {
          logger.warn(
            "Alias mapping failed for block %d type=%s: %o",
            i,
            block.type,
            aliasErr
          );
        }

        // validation via compiled zod (deterministic)
        if (comp.propsSchema) {
          const zschema = compilePropsSchema(comp.propsSchema);
          console.debug(
            "[CLI] zschema type info for block index=%d: %o",
            i,
            (zschema as any)?._def?.typeName
          );
          if (zschema) {
            const candidate = (block as any).props ?? {};
            console.debug(
              "[CLI] candidate props for validation index=%d: %o",
              i,
              candidate
            );

            // deterministic validation (no retries beyond wrapper)
            validateCandidateProps(zschema, candidate, block.type, i);

            console.debug(
              "[CLI] Validation PASSED for block index=%d type=%s",
              i,
              block.type
            );
          } else {
            logger.warn(
              "CLI: component %s has propsSchema but compilation failed; skipping strict validation",
              block.type
            );
          }
        } // end validation
      } // end layout loop

      // build page payload and create
      const payload = {
        slug:
          (path === "/"
            ? "home"
            : path.replace(/^\//, "").replace(/\//g, "-")) || "page",
        path,
        title,
        status: "draft" as const,
        layout,
      };

      const page = await pageService.createPage(payload as any, actorId);

      await createAuditEntry({
        actor: actorId,
        action: "create_page",
        resourceType: "page",
        resourceId: (page as any)._id?.toString?.() ?? (page as any).id,
        command: raw,
        success: true,
        details: { path: payload.path, slug: payload.slug },
      });

      console.debug(
        "[CLI] create_page completed for path=%s id=%s",
        payload.path,
        (page as any)._id?.toString?.()
      );
      return page;
    }

    // ---------- PUBLISH PAGE ----------
    if (action === "publish_page") {
      const { target } = parsed.payload;
      let page: any = null;

      if (/^[0-9a-fA-F]{24}$/.test(target)) {
        page = await pageService.publishPage(target, actorId);
      } else {
        const p = await (
          await import("../models/Page")
        ).default.findOne({ path: target });
        if (!p) throw { status: 404, message: "Page not found" };
        page = await pageService.publishPage(p._id.toString(), actorId);
      }

      await createAuditEntry({
        actor: actorId,
        action: "publish_page",
        resourceType: "page",
        resourceId: (page as any)._id?.toString?.() ?? (page as any).id,
        command: raw,
        success: true,
        details: { path: (page as any).path },
      });

      return page;
    }

    // ---------- DELETE PAGE ----------
    if (action === "delete_page") {
      const { target } = parsed.payload;
      let pageDoc: any = null;
      if (/^[0-9a-fA-F]{24}$/.test(target)) {
        pageDoc = await PageModel.findById(target);
      } else {
        pageDoc = await PageModel.findOne({ path: target });
      }
      if (!pageDoc) throw { status: 404, message: "Page not found" };

      await PageModel.deleteOne({ _id: pageDoc._id });

      await createAuditEntry({
        actor: actorId,
        action: "delete_page",
        resourceType: "page",
        resourceId: pageDoc._id.toString(),
        command: raw,
        success: true,
        details: { path: pageDoc.path },
      });

      return { ok: true };
    }

    // ---------- CREATE COMPONENT ----------
    if (action === "create_component") {
      const { type, displayName, propsSchema } = parsed.payload;
      if (!type || typeof type !== "string")
        throw { status: 400, message: "Component type is required" };

      const component = await componentService.createComponent({
        type,
        displayName,
        propsSchema,
      });

      await createAuditEntry({
        actor: actorId,
        action: "create_component",
        resourceType: "component",
        resourceId: component.id,
        command: raw,
        success: true,
        details: { type: component.type },
      });

      return component;
    }

    // ---------- LIST CONTACT SUBMISSIONS ----------
    if (action === "list_contacts") {
      const limit = parsed.payload?.limit || 50;
      const submissions = await contactService.getContactSubmissions(limit);

      await createAuditEntry({
        actor: actorId,
        action: "list_contacts",
        resourceType: "contact",
        resourceId: undefined,
        command: raw,
        success: true,
        details: { count: submissions.length },
      });

      return { submissions, count: submissions.length };
    }

    // ---------- MARK CONTACT AS READ ----------
    if (action === "mark_contact_read") {
      const { id } = parsed.payload;
      if (!id || typeof id !== "string")
        throw { status: 400, message: "Contact submission ID is required" };

      const submission = await contactService.markSubmissionAsRead(id);
      if (!submission)
        throw { status: 404, message: "Contact submission not found" };

      await createAuditEntry({
        actor: actorId,
        action: "mark_contact_read",
        resourceType: "contact",
        resourceId: id,
        command: raw,
        success: true,
        details: { name: submission.name },
      });

      return submission;
    }

    throw { status: 400, message: "Unsupported action" };
  } catch (err: any) {
    // audit failure
    try {
      await createAuditEntry({
        actor: actorId,
        action: action,
        resourceType: action?.startsWith("create") ? "page|component" : "page",
        resourceId: undefined,
        command: raw,
        success: false,
        details: { error: err?.message ?? err },
      });
    } catch (auditErr) {
      logger.warn("Audit failure after command failure: %o", auditErr);
    }
    // rethrow so controller can return proper response
    throw err;
  }
}
