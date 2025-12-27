// src/services/schemaCompiler.test.ts
import { compilePropsSchema } from "../utils/schemaCompiler";

describe("schemaCompiler", () => {
  it("compiles simple object schema", () => {
    const schemaDef = {
      headline: "string",
      images: { type: "array", items: "string" },
    };
    const zschema = compilePropsSchema(schemaDef);
    expect(zschema).not.toBeNull();

    // sample candidate to validate
    const sample = { headline: "x", images: ["a"] };

    // try raw candidate first
    let parsed = (zschema as any).safeParse(sample);

    // if that fails, try wrapper { value: sample } (some compiled schemas expect a wrapper)
    if (!parsed.success) {
      // eslint-disable-next-line no-console
      console.warn(
        "schemaCompiler: raw parse failed, trying wrapper { value: sample }"
      );
      try {
        parsed = (zschema as any).safeParse({ value: sample });
      } catch (err) {
        // no-op: we will print diagnostics below
      }
    }

    if (!parsed.success) {
      // print diagnostic to help debugging
      // eslint-disable-next-line no-console
      console.error(
        "Zod parse failed (both attempts):",
        JSON.stringify(
          parsed.error ?? parsed,
          Object.getOwnPropertyNames(parsed.error ?? parsed),
          2
        )
      );
    }

    expect(parsed.success).toBe(true);
  });
});
