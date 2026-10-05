// @vitest-environment jsdom
import { expect, test, vi } from "vitest";
import { z } from "zod";
import { PostHog } from "posthog-js";
import { Prism, flag } from "@priemskiyyy/prism";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { posthog } from "src/posthog";

const createClient = () => {
  const client = new PostHog();

  client.init(`phc_local_${crypto.randomUUID()}`, {
    api_host: "https://example.invalid",
    advanced_disable_feature_flags_on_first_load: true,
    disable_external_dependency_loading: true,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: "memory",
    request_batching: false,
    bootstrap: { distinctID: "alice", isIdentifiedID: true },
  });
  vi.spyOn(client, "_send_request").mockImplementation(() => {});
  client.featureFlags.receivedFeatureFlags({
    featureFlags: { off: false, test: "green" },
    featureFlagPayloads: { test: { color: "green" } },
  });

  return client;
};

testFlagAdapter<{ id: string; revision: number }>({
  name: "posthog",
  create: () => {
    const client = createClient();

    return {
      adapter: posthog({
        client,
        userId: (context) => context.id,
        resources: { enabled: { flag: "off", select: "enabled" } },
      }),
      context: { id: "alice", revision: 1 },
      nextContext: { id: "alice", revision: 2 },
      flags: [{ key: "enabled", fallback: false }],
      verify: (evaluations) => {
        expect(evaluations).toEqual({ enabled: { value: false } });
      },
    };
  },
});

test("reads enabled, variant and payload selections for the fixed identity", async () => {
  const client = createClient();

  const flags = new Prism({
    flags: {
      enabled: flag(z.boolean(), { fallback: true }),
      variant: flag(z.string(), { fallback: "none" }),
      payload: flag(z.record(z.string(), z.json()), { fallback: {} }),
      absent: flag(z.boolean(), { fallback: false }),
    },
    adapter: posthog({
      client,
      userId: (context: { id: string }) => context.id,
      resources: {
        enabled: { flag: "off", select: "enabled" },
        variant: { flag: "test", select: "variant" },
        payload: { flag: "test", select: "payload" },
        absent: { flag: "absent", select: "enabled" },
      },
    }),
  });

  await flags.start({ context: { id: "alice" } });
  expect(flags.flag("enabled").get()).toBe(false);
  expect(flags.flag("variant").details.get()).toMatchObject({
    value: "green",
    variant: "green",
  });
  expect(flags.flag("payload").get()).toEqual({ color: "green" });
  expect(flags.flag("absent").details.get().resolution).toBe("missing");
  client.featureFlags.receivedFeatureFlags({ featureFlags: { off: true } });
  await vi.waitFor(() => expect(flags.flag("enabled").get()).toBe(true));
  await flags.dispose();
});

test("a context that does not match the client's identity is a conflict", async () => {
  const client = createClient();

  const flags = new Prism({
    flags: { enabled: flag(z.boolean(), { fallback: true }) },
    adapter: posthog({
      client,
      userId: (context: { id: string }) => context.id,
      resources: { enabled: { flag: "off", select: "enabled" } },
    }),
  });

  await expect(flags.start({ context: { id: "bob" } })).rejects.toMatchObject({
    code: "CONTEXT_CONFLICT",
  });
  expect(flags.flag("enabled").get()).toBe(true);
  await flags.dispose();
});
