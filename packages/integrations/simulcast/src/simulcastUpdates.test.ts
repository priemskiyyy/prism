import { expect, test, vi } from "vitest";
import { RealtimeClient } from "@priemskiyyy/simulcast";
import { createMockAdapter } from "@priemskiyyy/simulcast/mock";
import { simulcastUpdates } from "src/simulcastUpdates";

type Context = { organization: string | null };

const createRealtime = () => {
  const { adapter, connections } = createMockAdapter();
  const client = new RealtimeClient({ adapter });

  client.connect();

  const connection = connections[0];

  if (connection === undefined) {
    throw new Error("Expected a mock connection.");
  }

  const subscription = (index: number) => {
    const entry = connection.subscriptions[index];

    if (entry === undefined) {
      throw new Error(`Expected subscription ${index}.`);
    }

    return entry;
  };

  return { client, connection, subscription };
};

test("refreshes on decoded publications and on every entry into the subscribed state", () => {
  const { client, connection, subscription } = createRealtime();
  const refresh = vi.fn();

  const stop = simulcastUpdates<Context>({
    client,
    channel: (context) =>
      context.organization && `organizations:${context.organization}:flags`,
    decode: (publication) => publication.data === "flags.changed",
  })({ organization: "studio" }, refresh);

  expect(connection.subscriptions.map((entry) => entry.channel)).toEqual([
    "organizations:studio:flags",
  ]);
  subscription(0).observer.state("subscribed");
  expect(refresh).toHaveBeenCalledTimes(1);
  subscription(0).observer.publication({
    data: "flags.changed",
    native: null,
  });
  subscription(0).observer.publication({ data: "chat.message", native: null });
  expect(refresh).toHaveBeenCalledTimes(2);
  subscription(0).observer.state("unsubscribed");
  subscription(0).observer.state("subscribed");
  expect(refresh).toHaveBeenCalledTimes(3);
  stop();
  expect(subscription(0).disposeCount).toBe(1);
  subscription(0).observer.publication({
    data: "flags.changed",
    native: null,
  });
  expect(refresh).toHaveBeenCalledTimes(3);
});

test("a null channel subscribes nothing", () => {
  const { client, connection } = createRealtime();
  const refresh = vi.fn();

  const stop = simulcastUpdates<Context>({
    client,
    channel: (context) => context.organization && "flags",
    decode: () => true,
  })({ organization: null }, refresh);

  expect(connection.subscriptions).toHaveLength(0);
  stop();
  expect(refresh).not.toHaveBeenCalled();
});
