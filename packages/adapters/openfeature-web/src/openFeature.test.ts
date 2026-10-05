import { afterEach, expect, test } from "vitest";
import { z } from "zod";
import { InMemoryProvider, OpenFeature } from "@openfeature/web-sdk";
import type { EvaluationContext, Logger } from "@openfeature/web-sdk";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { openFeature } from "src/openFeature";

class FlakyProvider extends InMemoryProvider {
  offline = true;

  async onContextChange() {
    if (this.offline) {
      throw new Error("offline");
    }
  }
}

const silentLogger: Logger = { debug() {}, info() {}, warn() {}, error() {} };

afterEach(async () => {
  await OpenFeature.clearProviders();
});

const FLAG_CONFIGURATION = {
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
};

const createFixture = async (
  provider: InMemoryProvider = new InMemoryProvider(FLAG_CONFIGURATION),
) => {
  const domain = `prism-web-${crypto.randomUUID()}`;

  await OpenFeature.setProviderAndWait(domain, provider);

  const client = OpenFeature.getClient(domain);

  client.setLogger(silentLogger);

  return { provider, client, domain };
};

testFlagAdapter<{ targetingKey: string }>({
  name: "openfeature-web",
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

test("sets the provider context once per Prism context and follows configuration changes", async () => {
  const { provider, client, domain } = await createFixture();

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
  expect(OpenFeature.getContext(domain)).toEqual({ targetingKey: "A" });
  expect(flags.flag("enabled").details.get()).toMatchObject({
    value: true,
    variant: "on",
  });
  expect(flags.flag("count").get()).toBe(0);
  expect(flags.flag("config").get()).toEqual({ upload: false });
  expect(flags.flag("missing").details.get().resolution).toBe("missing");
  expect(flags.flag("wrong").details.get().error?.code).toBe("VALIDATION");
  await flags.context({ user: "B" });
  expect(OpenFeature.getContext(domain)).toEqual({ targetingKey: "B" });
  expect(flags.flag("enabled").get()).toBe(false);
  await provider.putConfiguration({
    enabled: { variants: { on: true }, defaultVariant: "on", disabled: false },
  });
  await expect.poll(() => flags.flag("enabled").get()).toBe(true);
  await flags.dispose();
});

test("a context the provider fails to apply fails the read and the next read retries it", async () => {
  OpenFeature.setLogger(silentLogger);

  const provider = new FlakyProvider(FLAG_CONFIGURATION);
  const { client } = await createFixture(provider);

  const flags = new Prism({
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
    adapter: openFeature({
      client,
      context: (context: { user: string }) => ({ targetingKey: context.user }),
    }),
  });

  await expect(flags.start({ context: { user: "A" } })).rejects.toMatchObject({
    code: "EVALUATION_FAILED",
  });
  provider.offline = false;
  await flags.refresh();
  expect(flags.flag("enabled").get()).toBe(true);
  await flags.dispose();
});
