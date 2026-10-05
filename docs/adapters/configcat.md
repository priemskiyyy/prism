---
description: "ConfigCat with Prism: user objects from the context, snapshot reads, variation ids as variants, flagEvaluated hooks and configChanged updates."
---

# ConfigCat

```sh
pnpm add @priemskiyyy/prism-configcat @configcat/sdk
```

```ts
import * as configcatSdk from "@configcat/sdk";
import { configcat } from "@priemskiyyy/prism-configcat";

const client = configcatSdk.getClient(
  sdkKey,
  configcatSdk.PollingMode.AutoPoll,
);

const adapter = configcat({
  client,
  user: ({ userId, email, plan }: AppContext) => ({
    identifier: userId,
    email,
    custom: { plan },
  }),
});
```

| Option   | Meaning                                      |
| -------- | -------------------------------------------- |
| `client` | Your ConfigCat client                        |
| `user`   | Maps your context to a ConfigCat user object |

## How it works

- **Identify.** The adapter waits for the client to be ready. ConfigCat takes the user on every evaluation, so a context switch needs no network.
- **Read.** Each read takes one snapshot and evaluates every declared key with the mapped user. A setting ConfigCat does not have gets the `missing` resolution. An evaluation that falls back to ConfigCat's own default, for example after a type mismatch, becomes the flag's `error` with `EVALUATION_FAILED`. The variation id becomes the flag's `variant`.
- **Changes.** `configChanged` events refresh the runtime, in every polling mode.

ConfigCat settings are booleans, numbers and strings. Give each flag a schema for one of those, or a string schema that validates a format, such as an enum.

## Evaluation hooks

Every evaluation fires the client's `flagEvaluated` hook, so a read fires it once per declared key. Filter in the hook if you use it for analytics.

## Lifecycle

The application creates and disposes the client. Await `flags.dispose()` before `client.dispose()`.
