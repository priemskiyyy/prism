# @priemskiyyy/prism-launchdarkly-web

LaunchDarkly browser SDK (`@launchdarkly/js-client-sdk` 4.x) as a Prism adapter.

```ts
import { createClient } from "@launchdarkly/js-client-sdk";
import { launchdarkly } from "@priemskiyyy/prism-launchdarkly-web";

const client = createClient(clientSideId, { kind: "user", key: "anonymous" });
await client.start();
const adapter = launchdarkly({
  client,
  context: (context: { userId: string }) => ({
    kind: "user",
    key: context.userId,
  }),
  hash: (context) => fetchSecureModeHash(context),
});
```

The adapter identifies each new context with `noTimeout` and `sheddable: false`, passing the secure mode `hash` when you provide one. An identify that ends as `error`, `timeout` or `shed` fails the read, and the next read retries it. Reads take `allFlags()`, which sends no evaluation events, so call a variation method where the user sees the flag to record an exposure. Change events refresh the runtime. The application starts and closes the client; await `flags.dispose()` first.
