# @priemskiyyy/prism-simulcast

Refresh Prism from a Simulcast channel.

```ts
import { z } from "zod";
import { simulcastUpdates } from "@priemskiyyy/prism-simulcast";

const FlagsChanged = z.object({ type: z.literal("flags.changed") });

const flags = new Prism({
  adapter,
  flags: definitions,
  updates: simulcastUpdates({
    client: realtime,
    channel: (context) => `organizations:${context.organizationId}:flags`,
    decode: ({ data }) => FlagsChanged.safeParse(data).success,
  }),
});
```

`channel` maps a context to its channel name, or `null` for none. `decode` decides which publications refresh, so your own schema reads your own wire format. Every entry into the subscribed state refreshes too, so a change during a connection gap is picked up on reconnect. The application owns the realtime client and its connection.
