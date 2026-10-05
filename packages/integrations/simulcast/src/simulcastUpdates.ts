import type {
  RealtimeChannel,
  RealtimePublication,
} from "@priemskiyyy/simulcast";
import type { JsonObject, Unsubscribe } from "@priemskiyyy/prism";

export type SimulcastUpdatesOptions<
  C,
  Publication = unknown,
  Subscription = unknown,
> = {
  client: { channel(name: string): RealtimeChannel<Publication, Subscription> };
  channel: (context: C) => string | null;
  decode: (publication: RealtimePublication<Publication>) => boolean;
};

export const simulcastUpdates =
  <C = JsonObject, Publication = unknown, Subscription = unknown>({
    client,
    channel: toChannel,
    decode,
  }: SimulcastUpdatesOptions<C, Publication, Subscription>) =>
  (context: C, refresh: () => void): Unsubscribe => {
    const name = toChannel(context);

    if (name === null) {
      return () => {};
    }

    const channel = client.channel(name);

    let subscribed = channel.status.get().state === "subscribed";

    const stopStatus = channel.status.subscribe(() => {
      const wasSubscribed = subscribed;

      subscribed = channel.status.get().state === "subscribed";

      if (wasSubscribed || !subscribed) {
        return;
      }

      refresh();
    });

    const stopPublications = channel.subscribe((publication) => {
      if (!decode(publication)) {
        return;
      }

      refresh();
    });

    return () => {
      stopPublications();
      stopStatus();
    };
  };
