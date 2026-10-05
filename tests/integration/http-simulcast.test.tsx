import { createServer } from "node:http";
import { BroadcastChannel } from "node:worker_threads";
import { randomUUID } from "node:crypto";
import { text } from "node:stream/consumers";
import { createElement } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { RealtimeClient } from "@priemskiyyy/simulcast";
import { broadcastChannel } from "@priemskiyyy/simulcast-broadcast-channel";
import { Prism, flag } from "@priemskiyyy/prism";
import { http } from "@priemskiyyy/prism-http";
import { simulcastUpdates } from "@priemskiyyy/prism-simulcast";
import { useFlag } from "@priemskiyyy/prism-react";
import { z } from "zod";

const evaluationsSchema = z.record(z.string(), z.object({ value: z.json() }));
const FlagsChanged = z.object({ type: z.literal("flags.changed") });

test("renders publications and catches changes during a connection gap without a new publication", async () => {
  vi.stubGlobal("BroadcastChannel", BroadcastChannel);

  let enabled = false;
  let requests = 0;
  const bodies: unknown[] = [];

  const server = createServer(async (request, response) => {
    const parsed: unknown = JSON.parse(await text(request));

    bodies.push(parsed);
    requests += 1;
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ enabled: { value: enabled } }));
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  if (address === null || typeof address === "string") {
    throw new Error("Missing local address.");
  }

  const prefix = `prism-${randomUUID()}:`;

  const realtime = new RealtimeClient({
    adapter: broadcastChannel({ prefix }),
  });

  let disconnect = realtime.connect();
  const unrelated = vi.fn();
  const releaseUnrelated = realtime.channel("flags").subscribe(unrelated);
  const publisher = new BroadcastChannel(`${prefix}flags`);

  const flags = new Prism({
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
    adapter: http<{ user: string }>({
      request: async ({ context, keys, signal }) => {
        const response = await fetch(
          `http://127.0.0.1:${address.port}/evaluate`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ context, keys }),
            signal,
          },
        );

        const evaluations: unknown = await response.json();

        return evaluationsSchema.parse(evaluations);
      },
    }),
    updates: simulcastUpdates({
      client: realtime,
      channel: () => "flags",
      decode: ({ data }) => FlagsChanged.safeParse(data).success,
    }),
  });

  function Application() {
    return createElement(
      "output",
      null,
      useFlag(flags.flag("enabled")) ? "enabled" : "disabled",
    );
  }

  try {
    await flags.start({ context: { user: "a" } });
    render(createElement(Application));
    expect(screen.getByText("disabled")).toBeTruthy();
    await waitFor(() => {
      expect(flags.status.get().refreshing).toBe(false);
    });
    expect(bodies[0]).toEqual({ context: { user: "a" }, keys: ["enabled"] });

    enabled = true;
    await act(async () => {
      publisher.postMessage({ type: "flags.changed", keys: ["enabled"] });
    });
    await waitFor(() => {
      expect(screen.getByText("enabled")).toBeTruthy();
    });

    const beforeGap = requests;

    await act(async () => {
      disconnect();
    });
    expect(realtime.connection.get()).toBe("disconnected");
    enabled = false;
    await act(async () => {
      disconnect = realtime.connect();
    });
    await waitFor(() => {
      expect(screen.getByText("disabled")).toBeTruthy();
    });
    expect(requests).toBeGreaterThan(beforeGap);

    cleanup();
    await flags.dispose();

    const priorUnrelated = unrelated.mock.calls.length;

    publisher.postMessage({ type: "flags.changed" });
    await vi.waitFor(() => {
      expect(unrelated).toHaveBeenCalledTimes(priorUnrelated + 1);
    });
    expect(realtime.connection.get()).toBe("connected");
    expect(realtime.channel("flags").native.get()).not.toBeNull();
  } finally {
    cleanup();
    await flags.dispose();
    releaseUnrelated();
    publisher.close();
    disconnect();
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    vi.unstubAllGlobals();
  }
});
