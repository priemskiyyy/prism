# @priemskiyyy/prism-unleash

Unleash toggles, variants and payloads as Prism flags through the proxy client.

```ts
import { UnleashClient } from "unleash-proxy-client";
import { unleash } from "@priemskiyyy/prism-unleash";

const client = new UnleashClient({ url, clientKey, appName: "web" });
await client.start();
const adapter = unleash({
  client,
  context: (context: { userId: string }) => ({ userId: context.userId }),
  resources: {
    composer: { toggle: "new-composer", select: "enabled" },
    layout: { toggle: "layout", select: "variant" },
    limits: { toggle: "layout", select: "payload" },
  },
});
```

`resources` is keyed by flag key. The adapter calls `updateContext` for each new context. When the fetch for it fails, the read fails with `NETWORK` instead of serving the previous context's toggles, and the next read retries it. Reads take `getAllToggles()`, which records no metrics or impressions; call `isEnabled` or `getVariant` where the user sees the toggle to record them. `payload` selections decode `json` and `number` payloads, and a malformed payload fails only its own flag. `update` events refresh the runtime. The application starts and stops the client.
