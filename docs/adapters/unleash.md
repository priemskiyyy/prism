---
description: "Unleash with Prism through the proxy client: resources for enabled states, variants and payloads, context updates, JSON payload decoding and metrics."
---

# Unleash

The adapter uses the Unleash frontend client, `unleash-proxy-client`, which talks to the Frontend API or Unleash Edge.

```sh
pnpm add @priemskiyyy/prism-unleash unleash-proxy-client
```

```ts
import { UnleashClient } from "unleash-proxy-client";
import { unleash } from "@priemskiyyy/prism-unleash";

const client = new UnleashClient({ url, clientKey, appName: "web" });

await client.start();

const adapter = unleash({
  client,
  context: ({ userId, workspaceId }: AppContext) => ({
    userId,
    properties: { workspaceId },
  }),
  resources: {
    composer: { toggle: "new-composer", select: "enabled" },
    layout: { toggle: "inbox-layout", select: "variant" },
    limits: { toggle: "upload-limits", select: "payload" },
  },
});
```

| Option      | Meaning                                                    |
| ----------- | ---------------------------------------------------------- |
| `client`    | Your started `UnleashClient`                               |
| `context`   | Maps your context to an Unleash context                    |
| `resources` | For each flag key, the toggle to read and which part of it |

## Resources

An Unleash toggle has an enabled state, a variant and a variant payload. Each flag reads one of them:

| `select`  | Value                                                                                          | `variant`        |
| --------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| `enabled` | The toggle's enabled state, a boolean                                                          | none             |
| `variant` | The variant's name, when the toggle has an enabled variant                                     | the variant name |
| `payload` | The variant's payload: `json` and `number` payloads are parsed, `string` payloads stay strings | the variant name |

A toggle Unleash does not return, and a `variant` or `payload` selection without an enabled variant, get the `missing` resolution. A payload that is not valid JSON fails its own flag with `VALIDATION`. A flag without a resource fails the read with `INVALID_CONFIGURATION`.

## How it works

- **Identify.** Each new context is applied with `updateContext`, which fetches the toggles for it. When that fetch fails, the read fails with `NETWORK` instead of serving the previous context's toggles, and the next read retries.
- **Read.** A read takes `getAllToggles()` once and resolves every resource from it.
- **Changes.** The client's `update` event refreshes the runtime, on every poll that changed something.

## Metrics and impressions

`getAllToggles()` records no metrics or impression events. Call `isEnabled` or `getVariant` where the user sees the toggle to record them.

## Lifecycle

The application starts and stops the client. Await `flags.dispose()` before `client.stop()`.
