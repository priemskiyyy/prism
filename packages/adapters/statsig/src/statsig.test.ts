import { expect, test, vi } from "vitest";
import { z } from "zod";
import { StatsigClient } from "@statsig/js-client";
import type {
  DataAdapterResult,
  EvaluationsDataAdapter,
  StatsigUser,
} from "@statsig/js-client";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { statsig } from "src/statsig";

const createClient = async () => {
  const data = (user: StatsigUser): DataAdapterResult => ({
    source: "Network",
    receivedAt: Date.now(),
    stableID: null,
    fullUserHash: null,
    data: JSON.stringify({
      has_updates: true,
      time: Date.now(),
      hash_used: "none",
      feature_gates: {
        gate: {
          name: "gate",
          value: user.userID === "alice",
          rule_id: "rule",
          secondary_exposures: [],
        },
      },
      dynamic_configs: {
        config: {
          name: "config",
          value: { count: 7 },
          rule_id: "rule",
          secondary_exposures: [],
        },
        experiment: {
          name: "experiment",
          value: { color: "green" },
          rule_id: "rule",
          group_name: "treatment",
          secondary_exposures: [],
        },
      },
      layer_configs: {
        layer: {
          name: "layer",
          value: { size: 9 },
          rule_id: "rule",
          secondary_exposures: [],
          explicit_parameters: ["size"],
        },
      },
    }),
  });

  const dataAdapter = {
    attach: () => {},
    getDataSync: () => null,
    getDataAsync: async (
      _cached: DataAdapterResult | null,
      user: StatsigUser,
    ) => data(user),
    prefetchData: async () => {},
    setData: () => {},
    setDataLegacy: () => {},
  } satisfies EvaluationsDataAdapter;

  const client = new StatsigClient(
    `client-test-${crypto.randomUUID()}`,
    {},
    {
      dataAdapter,
      loggingEnabled: "disabled",
      disableStorage: true,
      networkConfig: { preventAllNetworkTraffic: true },
    },
  );

  await client.initializeAsync();

  return client;
};

testFlagAdapter<{ id: string }>({
  name: "statsig",
  create: async () => {
    const client = await createClient();

    return {
      adapter: statsig({
        client,
        user: (context) => ({ userID: context.id }),
        resources: { enabled: { type: "gate", name: "gate" } },
      }),
      context: { id: "alice" },
      nextContext: { id: "bob" },
      flags: [{ key: "enabled", fallback: false }],
      verify: (evaluations, context) => {
        expect(evaluations).toEqual({
          enabled: { value: context.id === "alice" },
        });
      },
      cleanup: () => client.shutdown(),
    };
  },
});

test("reads gates and parameters for the reconciled user and leaves the client running", async () => {
  const client = await createClient();

  const flags = new Prism({
    flags: {
      enabled: flag(z.boolean(), { fallback: false }),
      count: flag(z.number(), { fallback: 0 }),
      color: flag(z.string(), { fallback: "blue" }),
      size: flag(z.number(), { fallback: 0 }),
      absent: flag(z.boolean(), { fallback: false }),
    },
    adapter: statsig({
      client,
      user: (context: { id: string }) => ({ userID: context.id }),
      resources: {
        enabled: { type: "gate", name: "gate" },
        count: { type: "config", name: "config", parameter: "count" },
        color: { type: "experiment", name: "experiment", parameter: "color" },
        size: { type: "layer", name: "layer", parameter: "size" },
        absent: { type: "gate", name: "absent" },
      },
    }),
  });

  try {
    await flags.start({ context: { id: "alice" } });
    expect(client.getContext().user).toEqual({ userID: "alice" });
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.flag("count").get()).toBe(7);
    expect(flags.flag("color").details.get()).toMatchObject({
      value: "green",
      variant: "treatment",
    });
    expect(flags.flag("size").get()).toBe(9);
    expect(flags.flag("absent").details.get().resolution).toBe("missing");
    await flags.context({ id: "bob" });
    expect(client.getContext().user).toEqual({ userID: "bob" });
    expect(flags.flag("enabled").get()).toBe(false);

    const reads = vi.spyOn(client, "getFeatureGate");

    client.$emt({ name: "values_updated", status: "Ready", values: null });
    await vi.waitFor(() => expect(reads).toHaveBeenCalled());
    await flags.dispose();
    expect(client.loadingStatus).toBe("Ready");
  } finally {
    client.shutdown();
  }
});

test("a context change updates the user and reads the SDK once", async () => {
  const client = await createClient();

  const flags = new Prism({
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
    adapter: statsig({
      client,
      user: (context: { id: string }) => ({ userID: context.id }),
      resources: { enabled: { type: "gate", name: "gate" } },
    }),
  });

  try {
    await flags.start({ context: { id: "alice" } });

    const updates = vi.spyOn(client, "updateUserAsync");
    const reads = vi.spyOn(client, "getFeatureGate");

    await flags.context({ id: "bob" });
    expect(updates).toHaveBeenCalledTimes(1);
    expect(reads).toHaveBeenCalledTimes(1);
    expect(flags.flag("enabled").get()).toBe(false);
  } finally {
    await flags.dispose();
    client.shutdown();
  }
});

test("a flag without a resource is a configuration error", async () => {
  const client = await createClient();

  const flags = new Prism({
    flags: { unmapped: flag(z.boolean(), { fallback: false }) },
    adapter: statsig({
      client,
      user: () => ({ userID: "alice" }),
      resources: {},
    }),
  });

  try {
    await expect(flags.start({ context: {} })).rejects.toMatchObject({
      code: "INVALID_CONFIGURATION",
      key: "unmapped",
    });
  } finally {
    await flags.dispose();
    client.shutdown();
  }
});
