import { describe, expect, test } from "vitest";
import { z } from "zod";
import { PrismError } from "src/PrismError";
import { flag } from "src/flag";
import { LayoutSchema } from "src/testing/fixtures";

describe("flag declarations", () => {
  test("validates values through the schema", () => {
    const enabled = flag(z.boolean(), { fallback: false });

    expect(enabled.validate(true)).toBe(true);
    expect(() => enabled.validate("true")).toThrow(PrismError);
    expect(() =>
      flag(z.number(), { fallback: 1 }).validate(Number.NaN),
    ).toThrow(PrismError);

    const layout = flag(LayoutSchema, { fallback: "classic" });

    expect(layout.validate("compact")).toBe("compact");
    expect(() => layout.validate("wide")).toThrow(
      "Expected a supported layout.",
    );
  });

  test("a schema alone decides which values are valid", () => {
    const text = flag(z.union([z.string(), z.number()]), { fallback: "a" });

    expect(text.validate(5)).toBe(5);

    const list = flag(z.union([z.object({}), z.array(z.string())]), {
      fallback: {},
    });

    expect(list.validate(["a"])).toEqual(["a"]);
  });

  test("reports the first schema issue with its path", () => {
    const uploads = flag(z.object({ maxFiles: z.number() }), {
      fallback: { maxFiles: 1 },
    });

    expect(() => uploads.validate({ maxFiles: "many" })).toThrow(
      "Invalid input: expected number, received string at maxFiles",
    );
  });

  test("copies and freezes fallbacks and validated values", () => {
    const Settings = z.object({ nested: z.object({ count: z.number() }) });
    const fallback = { nested: { count: 1 } };
    const definition = flag(Settings, { fallback });

    fallback.nested.count = 2;
    expect(definition.fallback).toEqual({ nested: { count: 1 } });
    expect(Object.isFrozen(definition.fallback)).toBe(true);

    const value = definition.validate({ nested: { count: 3 } });

    expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(value.nested)).toBe(true);
  });

  test("copies the output of a schema that changes the value", () => {
    const layout = flag(z.string().trim(), { fallback: "classic" });

    const limits = flag(z.object({ maxFiles: z.number().default(3) }), {
      fallback: { maxFiles: 3 },
    });

    expect(layout.validate("  split ")).toBe("split");
    expect(limits.validate({})).toEqual({ maxFiles: 3 });
    expect(Object.isFrozen(limits.validate({}))).toBe(true);
  });

  test("passes the fallback through the schema like any other value", () => {
    const Uploads = z.object({ enabled: z.boolean(), maxFiles: z.number() });

    const uploads = flag(Uploads, {
      fallback: { maxFiles: 1, enabled: false },
    });

    expect(Object.keys(uploads.fallback)).toEqual(["enabled", "maxFiles"]);
    expect(flag(z.string().trim(), { fallback: " classic " }).fallback).toBe(
      "classic",
    );
  });

  test("rejects invalid fallbacks and asynchronous schemas", () => {
    // @ts-expect-error The fallback must satisfy the schema's output type.
    expect(() => flag(LayoutSchema, { fallback: "wide" })).toThrow("fallback");

    const Async = z.string().refine(async () => true);

    expect(() => flag(Async, { fallback: "a" })).toThrow(PrismError);
    expect(() =>
      flag(z.number(), { fallback: Number.POSITIVE_INFINITY }),
    ).toThrow("fallback");
  });

  test("keeps the provider key option", () => {
    expect(flag(z.boolean(), { fallback: false, key: "remote" }).key).toBe(
      "remote",
    );
    expect(flag(z.boolean(), { fallback: false })).not.toHaveProperty("key");
  });
});
