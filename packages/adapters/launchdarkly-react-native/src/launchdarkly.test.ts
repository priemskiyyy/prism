import { expect, test, vi } from "vitest";
import { z } from "zod";
import type {
  LDContext,
  LDIdentifyOptions,
  LDIdentifyResult,
} from "@launchdarkly/react-native-client-sdk";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { launchdarkly } from "src/launchdarkly";

type TestContext = { account: string };

type Identify = { context: LDContext; options: LDIdentifyOptions | undefined };

const createFixture = (status: LDIdentifyResult = { status: "completed" }) => {
  const flags = new Map<string, unknown>();
  const identifies: Identify[] = [];
  const listeners = new Set<() => void>();

  const client = {
    identifyResult: async (
      context: LDContext,
      options?: LDIdentifyOptions,
    ): Promise<LDIdentifyResult> => {
      identifies.push({ context, options });
      flags.set("enabled", Reflect.get(context, "key") === "A");

      return status;
    },
    allFlags: () => Object.fromEntries(flags),
    on: (_event: "change", listener: () => void) => {
      listeners.add(listener);
    },
    off: (_event: "change", listener: () => void) => {
      listeners.delete(listener);
    },
  };

  return {
    client,
    identifies,
    listeners,
    flags,
    context: (context: TestContext): LDContext => ({
      kind: "user",
      key: context.account,
    }),
  };
};

testFlagAdapter<TestContext>({
  name: "launchdarkly-react-native",
  create: () => {
    const fixture = createFixture();

    return {
      adapter: launchdarkly({
        client: fixture.client,
        context: fixture.context,
      }),
      context: { account: "A" },
      nextContext: { account: "B" },
      flags: [{ key: "enabled", fallback: false }],
      verify: (evaluations, context) => {
        expect(evaluations).toEqual({
          enabled: { value: context.account === "A" },
        });
      },
    };
  },
});

test("identifies through identifyResult, refreshes on change and releases its listener", async () => {
  const fixture = createFixture();

  const flags = new Prism({
    adapter: launchdarkly({ client: fixture.client, context: fixture.context }),
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
  });

  await flags.start({ context: { account: "A" } });
  await flags.refresh();
  expect(fixture.identifies).toEqual([
    {
      context: { kind: "user", key: "A" },
      options: { noTimeout: true, sheddable: false },
    },
  ]);
  expect(flags.flag("enabled").get()).toBe(true);
  fixture.flags.set("enabled", false);

  for (const listener of fixture.listeners) {
    listener();
  }

  await vi.waitFor(() => expect(flags.flag("enabled").get()).toBe(false));
  await flags.dispose();
  expect(fixture.listeners.size).toBe(0);
});

test("an identify that was shed fails the read", async () => {
  const fixture = createFixture({ status: "shed" });

  const flags = new Prism({
    adapter: launchdarkly({ client: fixture.client, context: fixture.context }),
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
  });

  await expect(
    flags.start({ context: { account: "A" } }),
  ).rejects.toMatchObject({
    code: "EVALUATION_FAILED",
  });
  await flags.dispose();
});
