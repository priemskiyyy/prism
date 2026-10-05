---
description: "The Prism runtime: constructor options, start, context, refresh and dispose, the status object, flag handles with get, subscribe and details, and how reads are deduplicated."
---

# The runtime

`new Prism(options)` creates the runtime that owns your flags: their current values, the current context, the adapter session and the status. Components and framework bindings only observe it.

```ts
import { Prism } from "@priemskiyyy/prism";

export const flags = new Prism({
  flags: definitions,
  adapter,
  updates: (context, refresh) => subscribeToFlagChanges(context, refresh),
  timeout: 5_000,
});
```

| Option    | Required | Meaning                                                                                                            |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `flags`   | yes      | The flag definitions, an object of `flag(...)` results                                                             |
| `adapter` | yes      | Where values come from. See [Choose a provider](adapters.md)                                                       |
| `updates` | no       | `(context, refresh) => unsubscribe`, called for every context to trigger refreshes. See [Live updates](updates.md) |
| `timeout` | no       | Milliseconds a read may take before it fails with `TIMEOUT`. Defaults to 10 000                                    |

Constructing a runtime validates the definitions and nothing else. It opens no connection, calls no adapter and reads no flag. The context type `C` comes from the adapter, so `start` and `context` only accept contexts the adapter can map.

## Lifecycle

```text
new Prism(...)      idle        values are the fallbacks
        │
    start({ context })    loading     adapter opened, context identified, first read
        │
        ▼
      ready ◀──────┐      context(next), refresh(), provider changes
        │          │      each one reads again
        ▼          │
      error ───────┘      the next successful read makes it ready again
        │
    dispose()             disposed    adapter released, values frozen
```

| Method               | Returns         | What it does                                                                                                                                                            |
| -------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start({ context })` | `Promise<void>` | Opens the adapter, identifies the context and reads every flag. Resolves when that read is applied and rejects with its error. Calling it again behaves like `context`. |
| `context(next)`      | `Promise<void>` | Replaces the whole context and reads for it. A context equal to the current one joins the read in flight instead.                                                       |
| `refresh()`          | `Promise<void>` | Reads again for the current context. Resolves once a read that started after the call has been applied.                                                                 |
| `dispose()`          | `Promise<void>` | Stops everything at once, then releases the adapter. Safe to call twice; both calls return the same promise.                                                            |

`context` and `refresh` reject with `NOT_STARTED` before `start`, and `start`, `context` and `refresh` reject with `DISPOSED` after `dispose`. A failed read rejects the promise of every caller waiting for it, keeps the current values and moves the status to `error`. [Context and identity](context.md) describes what a context switch resets.

### One read at a time

Every command funnels into one read path. `start`, `context`, `refresh`, adapter change events and `updates` all request a read, and one read runs at a time. A request that arrives before the running read has called the adapter joins it, because that read will still see the change. A later request waits and becomes the next read, together with everything else that arrived meanwhile. Ten change events during one slow read cost one extra read, not ten.

That also makes `refresh()` a barrier: when it resolves, the values reflect the provider's state from no earlier than the moment you called it.

## Status

```ts
flags.status.get();
// { state: "ready", refreshing: false }

flags.status.subscribe((status) => {
  if (status.state === "error") {
    reportError(status.error);
  }
});
```

| Field        | Type                                                      | Meaning                                                |
| ------------ | --------------------------------------------------------- | ------------------------------------------------------ |
| `state`      | `"idle" \| "loading" \| "ready" \| "error" \| "disposed"` | Where the runtime is in its lifecycle                  |
| `refreshing` | `boolean`                                                 | A read is in flight, in any state                      |
| `error`      | `PrismError \| undefined`                                 | Why the last read failed, present in the `error` state |

`loading` means the current context has not been read yet. `ready` with `refreshing: true` means the values are current and a newer read is running. The framework bindings expose the same object through `usePrismStatus()`.

## Handles

`flags.flag(key)` returns the handle for one flag. Handles are created once per runtime, so the same key always returns the same object.

```ts
const composer = flags.flag("composer");

composer.get(); // boolean
composer.details.get(); // { value, resolution, variant?, error? }
composer.key; // "composer"
composer.providerKey; // "new-composer"

const stop = composer.subscribe((enabled) => {
  console.log("composer is now", enabled);
});

stop();
```

| Member            | Meaning                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `get()`           | The current value. Never fetches and never evaluates.                                       |
| `subscribe(fn)`   | Calls `fn` with each new value. Returns an unsubscribe function.                            |
| `details`         | An observable of `{ value, resolution, variant?, error? }`. See [Flag details](details.md). |
| `key`             | The declaration key your code uses                                                          |
| `providerKey`     | The key the adapter sends to the provider                                                   |
| `override(value)` | Installs a local value. See [Local overrides](overrides.md).                                |

Subscriptions do not replay: `fn` runs on the next change, not with the current value. Read `get()` for that. Listeners run after the whole batch has been installed, so a listener that reads another flag sees the same read. A listener that throws does not stop the others; its error is rethrown in a microtask.

## Reading outside components

Handles work anywhere, not only in framework code. That makes them useful in routers, API clients and analytics:

```ts
export const uploadLimit = () => flags.flag("uploads").get().maxFiles;

router.beforeEach((to) => {
  if (to.meta.beta === true && !flags.flag("betaPages").get()) {
    return "/";
  }
});
```

To wait until the flags for the current context are known, await the promise of the command that started the read:

```ts
await flags.start({ context });
renderApplication();
```

## Where to create it

Create one runtime per application in a browser or a mobile app, at module scope or in the entry file, and start it where you know the user. On a server, create one per request so users never share a context. See [Server rendering](server-rendering.md).

Dispose it when its owner goes away: a test, a hot module replacement, a request. Components never dispose the runtime; unmounting a provider or a component only releases its subscriptions.
