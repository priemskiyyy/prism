import { expect, test, vi } from "vitest";
import { z } from "zod";
import { GrowthBook } from "@growthbook/growthbook";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { growthbook } from "src/growthbook";

type Context = { id: string };

const createClient = () =>
  new GrowthBook({
    features: {
      enabled: {
        defaultValue: false,
        rules: [{ condition: { id: "alice" }, force: true }],
      },
      color: {
        defaultValue: "blue",
        rules: [
          {
            key: "palette",
            variations: ["green", "red"],
            weights: [1, 0],
            hashAttribute: "id",
          },
        ],
      },
      limit: { defaultValue: 3 },
    },
  });

testFlagAdapter<Context>({
  name: "growthbook",
  create: () => {
    const client = createClient();

    return {
      adapter: growthbook({
        client,
        attributes: (context) => ({ id: context.id }),
      }),
      context: { id: "alice" },
      nextContext: { id: "bob" },
      flags: [{ key: "enabled", fallback: false }],
      verify: (evaluations, context) => {
        expect(evaluations).toEqual({
          enabled: { value: context.id === "alice", variant: undefined },
        });
      },
      cleanup: () => client.destroy(),
    };
  },
});

test("evaluates features for the mapped attributes, reports experiment variants and follows wired payload changes", async () => {
  const client = createClient();

  const flags = new Prism({
    flags: {
      enabled: flag(z.boolean(), { fallback: false }),
      color: flag(z.string(), { fallback: "blue" }),
      limit: flag(z.number(), { fallback: 0 }),
      missing: flag(z.boolean(), { fallback: false }),
    },
    adapter: growthbook({
      client,
      attributes: (context: Context) => ({ id: context.id }),
    }),
    updates: (_context, refresh) => {
      client.setRenderer(refresh);

      return () => client.setRenderer(null);
    },
  });

  try {
    await flags.start({ context: { id: "alice" } });
    expect(client.getAttributes()).toEqual({ id: "alice" });
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.flag("color").details.get()).toMatchObject({
      value: "green",
      variant: "0",
    });
    expect(flags.flag("limit").get()).toBe(3);
    expect(flags.flag("missing").details.get().resolution).toBe("missing");
    await flags.context({ id: "bob" });
    expect(flags.flag("enabled").get()).toBe(false);
    await client.setPayload({ features: { limit: { defaultValue: 9 } } });
    await vi.waitFor(() => expect(flags.flag("limit").get()).toBe(9));
    await flags.dispose();
  } finally {
    client.destroy();
  }
});

test("leaves the client's renderer to the application", async () => {
  const client = createClient();
  const render = vi.fn();

  client.setRenderer(render);

  const flags = new Prism({
    flags: { limit: flag(z.number(), { fallback: 0 }) },
    adapter: growthbook({
      client,
      attributes: (context: Context) => ({ id: context.id }),
    }),
  });

  try {
    await flags.start({ context: { id: "alice" } });
    await flags.dispose();
    render.mockClear();
    await client.setPayload({ features: { limit: { defaultValue: 9 } } });
    expect(render).toHaveBeenCalled();
  } finally {
    client.destroy();
  }
});
