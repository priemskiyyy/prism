# @priemskiyyy/prism-posthog

PostHog feature flags as Prism flags for one fixed identity.

```ts
import { posthog } from "@priemskiyyy/prism-posthog";

const adapter = posthog({
  client,
  userId: (context: { userId: string }) => context.userId,
  resources: {
    composer: { flag: "new-composer", select: "enabled" },
    variant: { flag: "layout", select: "variant" },
    limits: { flag: "layout", select: "payload" },
  },
});
```

`userId` maps the context to the `distinct_id` it expects. A read whose context maps to a different id than the client reports fails with `CONTEXT_CONFLICT`; the application owns `identify` and `reset`. Reads pass `send_event: false`, so they record no `$feature_flag_called` events; call `getFeatureFlag` where the user sees the flag to record one. Flag reloads refresh the runtime.
