---
description: "PrismError codes, where each one comes from, how failed reads keep values and set the status, per-flag errors, timeouts and patterns for retrying and reporting."
---

# Errors and recovery

Prism never trades a working page for an error. A failed read keeps every current value, a flag whose value fails its schema keeps its fallback, and the error is reported where you can see it. Every error is a `PrismError`.

```ts
import { PrismError } from "@priemskiyyy/prism";

if (error instanceof PrismError) {
  error.code; // "NETWORK"
  error.key; // the flag key, when the error belongs to one flag
  error.cause; // what the adapter or the SDK threw
}
```

## Where errors appear

| Where                                        | What                                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| The promise of `start`, `context`, `refresh` | The error of the read it waited for                                           |
| `flags.status.get().error`                   | The error of the last failed read, while `state` is `error`                   |
| `handle.details.get().error`                 | Why one flag holds its fallback, while its resolution is `error`              |
| Thrown synchronously                         | Configuration and usage mistakes: bad definitions, `override` after `dispose` |

A read that fails as a whole puts the runtime in the `error` state and changes no flag. The next successful read makes it `ready` again. A read that succeeds but carries a bad value for one flag leaves the runtime `ready` and puts only that flag in the `error` resolution.

## Codes

| Code                    | Raised by                                     | Means                                                                                                                        |
| ----------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `INVALID_CONFIGURATION` | `flag`, `new Prism`, adapters                 | A fallback fails its schema, a schema is async, keys collide, a timeout is out of range, a provider resource is not declared |
| `INVALID_CONTEXT`       | `start`, `context`, OpenFeature               | The context is not a plain JSON object, or the provider rejected it                                                          |
| `NOT_STARTED`           | `context`, `refresh`                          | Called before `start`                                                                                                        |
| `DISPOSED`              | Every command after `dispose`                 | The runtime was disposed                                                                                                     |
| `TIMEOUT`               | The runtime, LaunchDarkly                     | A read took longer than `timeout`, or identify timed out                                                                     |
| `NETWORK`               | Your API, Unleash                             | The provider could not be reached                                                                                            |
| `AUTHENTICATION`        | Your API                                      | Credentials were missing or rejected                                                                                         |
| `FORBIDDEN`             | Your API                                      | The credentials may not read these flags                                                                                     |
| `RATE_LIMITED`          | Your API                                      | The provider asked to slow down                                                                                              |
| `PROTOCOL`              | Your API                                      | The response was not in the expected shape                                                                                   |
| `CONTEXT_CONFLICT`      | PostHog                                       | The SDK identifies a different user than the context                                                                         |
| `EVALUATION_FAILED`     | Adapters, the runtime                         | The provider failed to evaluate; also what any unknown error becomes                                                         |
| `VALIDATION`            | The runtime, `override`, OpenFeature, Unleash | A value failed its schema, or a payload could not be parsed                                                                  |

Your own API client decides which of `NETWORK`, `AUTHENTICATION`, `FORBIDDEN`, `RATE_LIMITED` and `PROTOCOL` it throws. An adapter that throws a `PrismError` keeps its code; anything else becomes `EVALUATION_FAILED` with the original as `cause`.

## Timeouts

A read that takes longer than `timeout` milliseconds, 10 000 by default, fails with `TIMEOUT` and its signal is aborted. The runtime stops waiting even when an adapter ignores the signal, so a hung request cannot keep the status in `loading` forever.

```ts
new Prism({ flags, adapter, timeout: 3_000 });
```

## Recovering

Most failures heal on the next read. Provider change events and `updates` already trigger one; a retry with backoff covers providers that go quiet:

```ts
const retryWithBackoff = () => {
  let attempt = 0;

  return flags.status.subscribe((status) => {
    if (status.state === "ready") {
      attempt = 0;

      return;
    }

    if (status.state !== "error" || status.refreshing) {
      return;
    }

    const delay = Math.min(1_000 * 2 ** attempt, 60_000);

    attempt += 1;
    setTimeout(() => {
      flags.refresh().catch(() => {});
    }, delay);
  });
};

const stopRetrying = retryWithBackoff();
```

Each failed attempt publishes a new error status, which schedules the next attempt with twice the delay, and a successful read resets the counter.

Show the user something only when it matters. Stale flag values are rarely worth an error banner; a failure that blocks a purchase may be.

## Reporting

```ts
flags.status.subscribe((status) => {
  if (status.error !== undefined) {
    logger.warn("Feature flags could not be read", {
      code: status.error.code,
      cause: status.error.cause,
    });
  }
});

const watch = (key: FlagKey<typeof definitions>) =>
  flags.flag(key).details.subscribe(({ resolution, error }) => {
    if (resolution === "error") {
      logger.warn("Feature flag rejected", { key, message: error?.message });
    }
  });

watch("uploads");
watch("channels");
```

A flag in the `error` resolution after a deploy usually means the provider serves a shape the new schema does not accept. Its message names the flag, the failed check and the path.
