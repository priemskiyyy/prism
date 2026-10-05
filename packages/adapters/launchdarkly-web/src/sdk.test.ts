// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { z } from "zod";
import { createClient } from "@launchdarkly/js-client-sdk";
import { Prism, flag } from "@priemskiyyy/prism";
import { launchdarkly } from "src/launchdarkly";

afterEach(() => vi.unstubAllGlobals());

test("reads the released browser SDK through its snapshot path without evaluation hooks", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            enabled: { value: true, version: 1, variation: 0 },
            nullable: { value: null, version: 1, variation: 0 },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    ),
  );

  let evaluations = 0;

  const client = createClient(
    "fixture-client-id",
    { kind: "user", key: "A" },
    {
      streaming: false,
      fetchGoals: false,
      sendEvents: false,
      diagnosticOptOut: true,
      hooks: [
        {
          getMetadata: () => ({ name: "evaluation-counter" }),
          beforeEvaluation: (_context, data) => {
            evaluations += 1;

            return data;
          },
        },
      ],
    },
  );

  const close = vi.spyOn(client, "close");

  const flags = new Prism({
    flags: {
      enabled: flag(z.boolean(), { fallback: false }),
      nullable: flag(z.json(), { fallback: null }),
    },
    adapter: launchdarkly({
      client,
      context: (context: { account: string }) => ({
        kind: "user",
        key: context.account,
      }),
    }),
  });

  try {
    await client.start();
    await flags.start({ context: { account: "A" } });
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.flag("nullable").get()).toBeNull();
    expect(evaluations).toBe(0);
    await flags.dispose();
    expect(close).not.toHaveBeenCalled();
  } finally {
    await flags.dispose();
    await client.close();
  }
});
