import { expect, test, vi } from "vitest";
import { z } from "zod";
import { Prism, PrismError, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { http } from "src/http";
import type { HttpRequest } from "src/http";

type Context = { user: string };

testFlagAdapter<Context>({
  name: "http",
  create: () => ({
    adapter: http<Context>({
      request: ({ context }) => ({ enabled: { value: context.user === "a" } }),
    }),
    context: { user: "a" },
    nextContext: { user: "b" },
    flags: [{ key: "enabled", fallback: false }],
    verify: (evaluations, context) => {
      expect(evaluations).toEqual({ enabled: { value: context.user === "a" } });
    },
  }),
});

test("hands the context, provider keys and signal to the client and publishes its evaluations", async () => {
  const request = vi.fn(async ({ keys }: HttpRequest<Context>) =>
    Object.fromEntries(keys.map((key) => [key, { value: key.length }])),
  );

  const flags = new Prism({
    adapter: http<Context>({ request }),
    flags: {
      one: flag(z.number(), { fallback: 0 }),
      three: flag(z.number(), { fallback: 0, key: "remote-three" }),
    },
  });

  await flags.start({ context: { user: "a" } });
  expect(flags.flag("one").get()).toBe(3);
  expect(flags.flag("three").get()).toBe(12);
  expect(request.mock.calls[0]?.[0]).toMatchObject({
    context: { user: "a" },
    keys: ["one", "remote-three"],
  });
  expect(request.mock.calls[0]?.[0].signal).toBeInstanceOf(AbortSignal);
  await flags.dispose();
});

test("a Prism error from the client keeps its code and anything else is an evaluation failure", async () => {
  const request = vi
    .fn()
    .mockRejectedValueOnce(new PrismError({ code: "AUTHENTICATION" }))
    .mockRejectedValueOnce(new TypeError("offline"));

  const flags = new Prism({
    adapter: http<Context>({ request }),
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
  });

  await expect(flags.start({ context: { user: "a" } })).rejects.toMatchObject({
    code: "AUTHENTICATION",
  });
  await expect(flags.refresh()).rejects.toMatchObject({
    code: "EVALUATION_FAILED",
    cause: new TypeError("offline"),
  });
  await flags.dispose();
});
