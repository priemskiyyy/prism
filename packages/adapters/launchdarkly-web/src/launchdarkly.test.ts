import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { createFixture } from "src/fixture";
import type { TestContext } from "src/fixture";
import { launchdarkly } from "src/launchdarkly";

testFlagAdapter<TestContext>({
  name: "launchdarkly-web",
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

describe("identity", () => {
  test("identifies each context with settlement options and a secure hash", async () => {
    const fixture = createFixture();

    const flags = new Prism({
      adapter: launchdarkly({
        client: fixture.client,
        context: fixture.context,
        hash: async (context) => `hash-${context.account}`,
      }),
      flags: {
        enabled: flag(z.boolean(), { fallback: false }),
        nullable: flag(z.json(), { fallback: null }),
      },
    });

    await flags.start({ context: { account: "A" } });
    await flags.refresh();
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.flag("nullable").get()).toBeNull();
    await flags.context({ account: "B" });
    expect(flags.flag("enabled").get()).toBe(false);
    expect(fixture.identifies).toEqual([
      {
        context: { kind: "user", key: "A" },
        options: { noTimeout: true, sheddable: false, hash: "hash-A" },
      },
      {
        context: { kind: "user", key: "B" },
        options: { noTimeout: true, sheddable: false, hash: "hash-B" },
      },
    ]);
    await flags.dispose();
  });

  test("a failed identify rejects the read with its status and the next read retries it", async () => {
    const fixture = createFixture();

    fixture.setManual(true);

    const flags = new Prism({
      adapter: launchdarkly({
        client: fixture.client,
        context: fixture.context,
      }),
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const startup = flags.start({ context: { account: "A" } });

    await vi.waitFor(() => expect(fixture.identifies).toHaveLength(1));
    fixture.settle({ status: "timeout", timeout: 0 });
    await expect(startup).rejects.toMatchObject({ code: "TIMEOUT" });

    const retry = flags.refresh();

    await vi.waitFor(() => expect(fixture.identifies).toHaveLength(2));
    fixture.settle({ status: "completed" });
    await retry;
    expect(flags.flag("enabled").get()).toBe(true);
    await flags.dispose();
  });
});

test("a change event refreshes flags and disposal removes the listener", async () => {
  const fixture = createFixture();

  const flags = new Prism({
    adapter: launchdarkly({ client: fixture.client, context: fixture.context }),
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
  });

  await flags.start({ context: { account: "B" } });
  expect(fixture.identifies).toEqual([
    {
      context: { kind: "user", key: "B" },
      options: { noTimeout: true, sheddable: false },
    },
  ]);
  fixture.setValue(true);
  fixture.emit();
  await vi.waitFor(() => expect(flags.flag("enabled").get()).toBe(true));
  await flags.dispose();
  expect(fixture.listenerCount).toBe(0);
});
