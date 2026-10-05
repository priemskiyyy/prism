---
description: "Keep feature flags current: provider change events, the updates option for any realtime client, the Simulcast integration, polling, refreshing on focus and on app foreground, and how refresh() behaves."
---

# Live updates

Flags change while your application runs: someone flips a kill switch, a rollout widens, a user upgrades. Prism refreshes when told to, in three ways, and all three go through the same deduplicated [read path](runtime.md#one-read-at-a-time).

## Provider change events

SDK adapters listen to their SDK's change event and refresh on their own. You do nothing:

| Adapter                     | Refreshes on                                                |
| --------------------------- | ----------------------------------------------------------- |
| OpenFeature, server and web | Provider `Ready`, `ConfigurationChanged` and `Stale` events |
| LaunchDarkly, web and RN    | `change`                                                    |
| Unleash                     | `update`                                                    |
| Statsig                     | `values_updated`                                            |
| PostHog                     | Feature flag reloads                                        |
| ConfigCat                   | `configChanged`                                             |
| GrowthBook                  | Through `updates`, see below                                |
| Your API, memory            | Through `updates`, or when you call `refresh()`             |

Whether the SDK streams, polls or waits for a page load is the SDK's configuration. Prism reads its current values whenever it reports a change.

## The `updates` option

`updates` connects anything else that knows about changes: a WebSocket, server-sent events, a push notification, a timer.

```ts
const flags = new Prism({
  flags: definitions,
  adapter,
  updates: (context, refresh) => {
    const events = new EventSource(
      `/api/flags/stream?workspace=${context.workspaceId}`,
    );

    events.addEventListener("flags-changed", refresh);

    return () => events.close();
  },
});
```

The runtime calls `updates` with each context once it is started for it, and calls the function it returned before the next context or on `dispose`. So a subscription that depends on the context, like a channel per workspace, follows context switches without extra code.

`refresh` requests a read and never throws. Calling it many times in a burst costs at most one extra read. An error thrown by `updates` or by its unsubscribe function is reported without breaking the context switch that called it.

## Simulcast

[Simulcast](https://github.com/priemskiyyy/simulcast) keeps realtime subscriptions provider-independent. `@priemskiyyy/prism-simulcast` turns a Simulcast channel into an `updates` function:

```ts
import { Prism } from "@priemskiyyy/prism";
import { simulcastUpdates } from "@priemskiyyy/prism-simulcast";
import { z } from "zod";

const FlagsChanged = z.object({ type: z.literal("flags.changed") });

const flags = new Prism({
  flags: definitions,
  adapter,
  updates: simulcastUpdates({
    client: realtime,
    channel: (context) => `workspaces:${context.workspaceId}:flags`,
    decode: ({ data }) => FlagsChanged.safeParse(data).success,
  }),
});
```

| Option    | Meaning                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------- |
| `client`  | Your Simulcast `RealtimeClient`, or anything with a `channel(name)` method                     |
| `channel` | Maps a context to a channel name, or `null` for a context without one                          |
| `decode`  | Decides which publications mean "flags changed", with your own schema for your own wire format |

A publication that `decode` accepts refreshes the flags. So does every return to the subscribed state after a disconnect, because a change could have happened during the gap. The application owns the realtime client and its connection; the integration only subscribes to one channel per context.

## Polling

A timer is an `updates` function too:

```ts
updates: (_context, refresh) => {
  const timer = setInterval(refresh, 60_000);

  return () => clearInterval(timer);
},
```

## Refresh on focus

Browser tabs and mobile apps spend a long time in the background. Refreshing when the user comes back is cheap and catches most changes:

::: code-group

```ts [Browser]
updates: (_context, refresh) => {
  const onVisible = () => {
    if (document.visibilityState === "visible") {
      refresh();
    }
  };

  document.addEventListener("visibilitychange", onVisible);

  return () => document.removeEventListener("visibilitychange", onVisible);
},
```

```ts [React Native]
import { AppState } from "react-native";

updates: (_context, refresh) => {
  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      refresh();
    }
  });

  return () => subscription.remove();
},
```

:::

## Several sources

Combine sources in one function; each returns its own cleanup:

```ts
updates: (context, refresh) => {
  const stops = [
    simulcast(context, refresh),
    focus(context, refresh),
  ];

  return () => {
    for (const stop of stops) {
      stop();
    }
  };
},
```

## Calling `refresh()` yourself

`flags.refresh()` reads now and resolves once a read that started after the call has been applied. Await it after an action that you know changes flags, such as a plan upgrade:

```ts
await api.upgradePlan(workspaceId);
await flags.refresh();
navigate("/billing/success");
```

When the context itself changes, call `context(next)` instead; it resets and reads in one step.
