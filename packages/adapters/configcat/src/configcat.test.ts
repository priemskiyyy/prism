import { expect, test, vi } from "vitest";
import { z } from "zod";
import {
  createSettingFromValue,
  getClient,
  OverrideBehaviour,
  PollingMode,
} from "@configcat/sdk";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { configcat } from "src/configcat";

const createClient = () =>
  getClient(`local-test-${crypto.randomUUID()}`, PollingMode.ManualPoll, {
    flagOverrides: {
      dataSource: {
        getOverrides: () => ({
          enabled: createSettingFromValue(true),
          count: createSettingFromValue(3),
          label: createSettingFromValue("native"),
        }),
      },
      behaviour: OverrideBehaviour.LocalOnly,
    },
  });

testFlagAdapter<{ id: string }>({
  name: "configcat",
  create: () => {
    const client = createClient();

    return {
      adapter: configcat({
        client,
        user: (context) => ({ identifier: context.id }),
      }),
      context: { id: "alice" },
      nextContext: { id: "bob" },
      flags: [{ key: "enabled", fallback: false }],
      verify: (evaluations) => {
        expect(evaluations).toEqual({ enabled: { value: true } });
      },
      cleanup: () => client.dispose(),
    };
  },
});

test("reads primitive settings, reports missing keys and follows config changes", async () => {
  const client = createClient();
  const on = vi.spyOn(client, "on");

  const flags = new Prism({
    flags: {
      enabled: flag(z.boolean(), { fallback: false }),
      count: flag(z.number(), { fallback: 0 }),
      alias: flag(z.string(), { fallback: "fallback", key: "label" }),
      missing: flag(z.boolean(), { fallback: false }),
    },
    adapter: configcat({
      client,
      user: (context: { id: string }) => ({ identifier: context.id }),
    }),
  });

  try {
    await flags.start({ context: { id: "alice" } });
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.flag("count").get()).toBe(3);
    expect(flags.flag("alias").get()).toBe("native");
    expect(flags.flag("missing").details.get().resolution).toBe("missing");

    const listener = on.mock.calls.find(
      ([event]) => event === "configChanged",
    )?.[1];

    expect(listener).toBeTypeOf("function");

    const reads = vi.spyOn(client, "snapshot");

    if (typeof listener === "function") {
      Reflect.apply(listener, client, []);
    }

    await vi.waitFor(() => expect(reads).toHaveBeenCalled());

    const dispose = vi.spyOn(client, "dispose");

    await flags.dispose();
    expect(dispose).not.toHaveBeenCalled();
  } finally {
    client.dispose();
  }
});
