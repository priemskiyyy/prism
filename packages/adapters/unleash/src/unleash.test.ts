import { expect, test, vi } from "vitest";
import { z } from "zod";
import { InMemoryStorageProvider, UnleashClient } from "unleash-proxy-client";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { unleash } from "src/unleash";

type Context = { id: string };

const createClient = () =>
  new UnleashClient({
    url: "https://unleash.test/api/frontend",
    clientKey: "client-key",
    appName: "prism-test",
    disableRefresh: true,
    disableMetrics: true,
    storageProvider: new InMemoryStorageProvider(),
    bootstrap: [
      {
        name: "composer",
        enabled: true,
        impressionData: false,
        variant: {
          name: "green",
          enabled: true,
          payload: { type: "json", value: '{"maxFiles":8}' },
        },
      },
      {
        name: "plain",
        enabled: false,
        impressionData: false,
        variant: { name: "disabled", enabled: false },
      },
      {
        name: "broken",
        enabled: true,
        impressionData: false,
        variant: {
          name: "blue",
          enabled: true,
          payload: { type: "json", value: "{not json" },
        },
      },
    ],
  });

testFlagAdapter<Context>({
  name: "unleash",
  create: () => {
    const client = createClient();

    return {
      adapter: unleash({
        client,
        context: (context) => ({ userId: context.id }),
        resources: { enabled: { toggle: "composer", select: "enabled" } },
      }),
      context: { id: "alice" },
      nextContext: { id: "bob" },
      flags: [{ key: "enabled", fallback: false }],
      verify: (evaluations) => {
        expect(evaluations).toEqual({ enabled: { value: true } });
      },
      cleanup: () => client.stop(),
    };
  },
});

test("updates the client context, selects toggles, variants and payloads, and follows updates", async () => {
  const client = createClient();
  const updateContext = vi.spyOn(client, "updateContext");

  const flags = new Prism({
    flags: {
      enabled: flag(z.boolean(), { fallback: false }),
      variant: flag(z.string(), { fallback: "none" }),
      limits: flag(z.record(z.string(), z.json()), { fallback: {} }),
      plain: flag(z.boolean(), { fallback: true }),
      plainVariant: flag(z.string(), { fallback: "none" }),
      absent: flag(z.boolean(), { fallback: false }),
    },
    adapter: unleash({
      client,
      context: (context: Context) => ({ userId: context.id }),
      resources: {
        enabled: { toggle: "composer", select: "enabled" },
        variant: { toggle: "composer", select: "variant" },
        limits: { toggle: "composer", select: "payload" },
        plain: { toggle: "plain", select: "enabled" },
        plainVariant: { toggle: "plain", select: "variant" },
        absent: { toggle: "absent", select: "enabled" },
      },
    }),
  });

  try {
    await flags.start({ context: { id: "alice" } });
    expect(updateContext).toHaveBeenCalledExactlyOnceWith({ userId: "alice" });
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.flag("variant").details.get()).toMatchObject({
      value: "green",
      variant: "green",
    });
    expect(flags.flag("limits").get()).toEqual({ maxFiles: 8 });
    expect(flags.flag("plain").get()).toBe(false);
    expect(flags.flag("plainVariant").details.get().resolution).toBe("missing");
    expect(flags.flag("absent").details.get().resolution).toBe("missing");
    await flags.refresh();
    expect(updateContext).toHaveBeenCalledOnce();
    await flags.context({ id: "bob" });
    expect(updateContext).toHaveBeenLastCalledWith({ userId: "bob" });

    const reads = vi.spyOn(client, "getAllToggles");

    client.emit("update");
    await vi.waitFor(() => expect(reads).toHaveBeenCalled());
    await flags.dispose();
  } finally {
    client.stop();
  }
});

test("a malformed payload fails only its own flag", async () => {
  const client = createClient();

  const flags = new Prism({
    flags: {
      enabled: flag(z.boolean(), { fallback: false }),
      broken: flag(z.record(z.string(), z.json()), { fallback: {} }),
    },
    adapter: unleash({
      client,
      context: (context: Context) => ({ userId: context.id }),
      resources: {
        enabled: { toggle: "composer", select: "enabled" },
        broken: { toggle: "broken", select: "payload" },
      },
    }),
  });

  try {
    await flags.start({ context: { id: "alice" } });
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.flag("broken").details.get()).toMatchObject({
      value: {},
      resolution: "error",
      error: { code: "VALIDATION", key: "broken" },
    });
  } finally {
    await flags.dispose();
    client.stop();
  }
});

test("a toggle fetch that fails for a new context fails the read instead of serving the previous toggles", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  let available = true;

  const client = new UnleashClient({
    url: "https://unleash.test/api/frontend",
    clientKey: "client-key",
    appName: "prism-test",
    disableRefresh: true,
    disableMetrics: true,
    storageProvider: new InMemoryStorageProvider(),
    fetch: async () =>
      available
        ? Response.json({
            toggles: [
              {
                name: "composer",
                enabled: true,
                impressionData: false,
                variant: { name: "disabled", enabled: false },
              },
            ],
          })
        : new Response(null, { status: 503 }),
  });

  await client.start();

  const flags = new Prism({
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
    adapter: unleash({
      client,
      context: (context: Context) => ({ userId: context.id }),
      resources: { enabled: { toggle: "composer", select: "enabled" } },
    }),
  });

  try {
    await flags.start({ context: { id: "alice" } });
    expect(flags.flag("enabled").get()).toBe(true);
    available = false;
    await expect(flags.context({ id: "bob" })).rejects.toMatchObject({
      code: "NETWORK",
    });
    expect(flags.flag("enabled").details.get()).toEqual({
      value: false,
      resolution: "pending",
    });
  } finally {
    await flags.dispose();
    client.stop();
  }
});
