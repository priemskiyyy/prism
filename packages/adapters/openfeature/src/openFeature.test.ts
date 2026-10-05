import { afterEach, expect, test } from "vitest";
import { z } from "zod";
import { OpenFeature, TypedInMemoryProvider } from "@openfeature/server-sdk";
import type { EvaluationContext } from "@openfeature/server-sdk";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { openFeature } from "src/openFeature";

afterEach(async () => {
  await OpenFeature.clearProviders();
});

const createFixture = async () => {
  const provider = new TypedInMemoryProvider({
    enabled: {
      variants: { on: true, off: false },
      defaultVariant: "off",
      disabled: false,
      contextEvaluator: (context: EvaluationContext) =>
        context.targetingKey === "A" ? "on" : "off",
    },
    count: {
      variants: { default: 0 },
      defaultVariant: "default",
      disabled: false,
    },
    config: {
      variants: { default: { upload: false } },
      defaultVariant: "default",
      disabled: false,
    },
    wrong: {
      variants: { default: "string" },
      defaultVariant: "default",
      disabled: false,
    },
  });

  const domain = `prism-test-${crypto.randomUUID()}`;

  await OpenFeature.setProviderAndWait(domain, provider);

  const client = OpenFeature.getClient(domain);

  client.setLogger({ debug() {}, info() {}, warn() {}, error() {} });

  return { provider, client };
};

testFlagAdapter<{ targetingKey: string }>({
  name: "openfeature",
  create: async () => {
    const { client } = await createFixture();

    return {
      adapter: openFeature({
        client,
        context: (context: { targetingKey: string }) => context,
      }),
      context: { targetingKey: "A" },
      nextContext: { targetingKey: "B" },
      flags: [{ key: "enabled", fallback: false }],
      verify: (evaluations, context) => {
        const on = context.targetingKey === "A";

        expect(evaluations).toEqual({
          enabled: { value: on, variant: on ? "on" : "off" },
        });
      },
    };
  },
});

test("evaluates each declared kind with the mapped context and follows configuration changes", async () => {
  const { provider, client } = await createFixture();

  const flags = new Prism({
    flags: {
      enabled: flag(z.boolean(), { fallback: false }),
      count: flag(z.number(), { fallback: 1 }),
      config: flag(z.record(z.string(), z.json()), { fallback: {} }),
      missing: flag(z.boolean(), { fallback: false }),
      wrong: flag(z.boolean(), { fallback: false }),
    },
    adapter: openFeature({
      client,
      context: (context: { user: string }) => ({ targetingKey: context.user }),
    }),
  });

  await flags.start({ context: { user: "A" } });
  expect(flags.flag("enabled").details.get()).toMatchObject({
    value: true,
    variant: "on",
  });
  expect(flags.flag("count").get()).toBe(0);
  expect(flags.flag("config").get()).toEqual({ upload: false });
  expect(flags.flag("missing").details.get().resolution).toBe("missing");
  expect(flags.flag("wrong").details.get().error?.code).toBe("VALIDATION");
  expect(client.getContext()).toEqual({});
  await flags.context({ user: "B" });
  expect(flags.flag("enabled").get()).toBe(false);
  provider.putConfiguration({
    enabled: { variants: { on: true }, defaultVariant: "on", disabled: false },
  });
  await expect.poll(() => flags.flag("enabled").get()).toBe(true);
  await flags.dispose();
});
