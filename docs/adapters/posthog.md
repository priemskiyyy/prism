---
description: "PostHog feature flags with Prism: enabled states, variants and JSON payloads as typed flags, the distinct_id check, flag reloads and reads that send no $feature_flag_called events."
---

# PostHog

```sh
pnpm add @priemskiyyy/prism-posthog posthog-js
```

```ts
import posthogJs from "posthog-js";
import { posthog } from "@priemskiyyy/prism-posthog";

posthogJs.init(projectKey, { api_host: "https://eu.i.posthog.com" });

const adapter = posthog({
  client: posthogJs,
  userId: ({ userId }: AppContext) => userId,
  resources: {
    composer: { flag: "new-composer", select: "enabled" },
    layout: { flag: "inbox-layout", select: "variant" },
    limits: { flag: "inbox-layout", select: "payload" },
  },
});
```

| Option      | Meaning                                                          |
| ----------- | ---------------------------------------------------------------- |
| `client`    | Your initialized PostHog instance                                |
| `userId`    | Maps your context to the `distinct_id` it belongs to             |
| `resources` | For each flag key, the PostHog flag and which part of it to read |

## Resources

| `select`  | Value                               |
| --------- | ----------------------------------- |
| `enabled` | Whether the flag is enabled         |
| `variant` | The multivariate flag's variant key |
| `payload` | The flag's JSON payload             |

The flag's variant is reported as `variant` for every selection. A flag PostHog does not return, or a selection it has no value for, gets the `missing` resolution. A flag without a resource fails the read with `INVALID_CONFIGURATION`.

## One identity at a time

PostHog evaluates flags for the user it has identified, and the SDK owns that identity. The adapter never calls `identify`; it checks instead. A read whose context maps to a different `distinct_id` than the client reports fails with `CONTEXT_CONFLICT`, so flags for one user are never shown under another.

Identify before you switch the context:

```ts
posthogJs.identify(user.id);
await flags.context({ userId: user.id, plan: user.plan });
```

On sign-out, call `posthogJs.reset()` and switch to the anonymous context the same way.

## How it works

- **Read.** Each resource is read with `getFeatureFlagResult` and `send_event: false`, so reads record no `$feature_flag_called` events.
- **Changes.** Flag reloads, after `identify`, `reloadFeatureFlags` or the SDK's own refresh, refresh the runtime.

Call `getFeatureFlag` where the user sees the flag to record the event.
