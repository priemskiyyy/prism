import { expect, test } from "vitest";
import { z } from "zod";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { memory } from "src/memory";

type Context = { user: string };

testFlagAdapter<Context>({
  name: "memory",
  create: () => ({
    adapter: memory<Context>({
      values: (context) => ({ enabled: context.user === "a" }),
    }),
    context: { user: "a" },
    nextContext: { user: "b" },
    flags: [{ key: "enabled", fallback: false }],
    verify: (evaluations, context) => {
      expect(evaluations).toEqual({ enabled: { value: context.user === "a" } });
    },
  }),
});

test("values are read on every read; false and null are values and absent keys fall back", async () => {
  const values = { enabled: false, nothing: null, config: { value: 1 } };

  const flags = new Prism({
    adapter: memory({ values: () => values }),
    flags: {
      enabled: flag(z.boolean(), { fallback: true }),
      nothing: flag(z.json(), { fallback: null }),
      config: flag(z.record(z.string(), z.json()), { fallback: {} }),
      missing: flag(z.number(), { fallback: 0 }),
    },
  });

  await flags.start({ context: {} });
  expect(flags.flag("enabled").get()).toBe(false);
  expect(flags.flag("nothing").get()).toBeNull();
  expect(flags.flag("nothing").details.get().resolution).toBe("resolved");
  expect(flags.flag("config").get()).toEqual({ value: 1 });
  expect(flags.flag("missing").details.get().resolution).toBe("missing");
  values.config.value = 2;
  await flags.refresh();
  expect(flags.flag("config").get()).toEqual({ value: 2 });
  await flags.dispose();
});
