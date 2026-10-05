---
description: "Write a Prism adapter for any flag provider: the open, identify, read and dispose contract, invalidation, errors, application-owned clients and the conformance suite."
---

# Writing an adapter

An adapter is a factory that returns a `FlagAdapter`. Wrap it with `createFlagAdapter` so disposal is idempotent and the observer stays silent afterwards. The [LaunchDarkly web adapter](https://github.com/priemskiyyy/prism/blob/main/packages/adapters/launchdarkly-web/src/launchdarkly.ts) is a complete example of an SDK with a current identity, and the [memory adapter](https://github.com/priemskiyyy/prism/blob/main/packages/adapters/memory/src/memory.ts) of one without.

```ts
import { createFlagAdapter } from "@priemskiyyy/prism";
import type { Evaluation, FlagAdapter } from "@priemskiyyy/prism";

export const provider = <C>({
  client,
}: {
  client: ProviderClient;
}): FlagAdapter<C> =>
  createFlagAdapter({
    name: "provider",
    open: ({ invalidate }) => {
      client.on("change", invalidate);
      return {
        identify: (context) => client.identify(context),
        read: ({ flags }) => {
          const snapshot = new Map(Object.entries(client.allFlags()));
          const evaluations = new Map<string, Evaluation>();
          for (const { key } of flags) {
            if (!snapshot.has(key)) {
              continue;
            }
            evaluations.set(key, { value: snapshot.get(key) });
          }
          return Object.fromEntries(evaluations);
        },
        dispose: () => {
          client.off("change", invalidate);
        },
      };
    },
  });
```

## Contract

- `open` is called once per runtime, when `start` runs. Attach listeners here and release them in `dispose`.
- `identify` receives every new context before its first read. Switch the SDK to it and settle once the SDK serves values for it; throw when it cannot, and the next read retries. The core never overlaps identify calls, skips a context that was replaced while it waited and waits for a pending identify before `read` and `dispose`. An SDK that takes the context on every evaluation returns immediately or waits for its readiness.
- `read` receives the frozen JSON context, `flags` as `{ key, fallback }` pairs with provider keys, and an `AbortSignal`. Return every evaluation you have. An absent key means the provider has no value and the fallback applies. Use `{ error }` for a per-key failure and throw for a failure of the whole read. The core validates values against their schemas, so return raw provider data.
- Call `invalidate` when the provider reports a change. The core schedules a read; you never push values. An invalidation that arrives while `identify` runs joins the read that is waiting for it.
- Take an application-owned `client`. Never construct, initialize or close it.
- Say in the README what a read records: exposures, metrics or impressions.

## Errors

Throw `PrismError` with a stable code: `NETWORK`, `AUTHENTICATION`, `FORBIDDEN`, `RATE_LIMITED`, `PROTOCOL`, `TIMEOUT`, `CONTEXT_CONFLICT`, `EVALUATION_FAILED`, `VALIDATION`, `INVALID_CONTEXT` or `INVALID_CONFIGURATION`. Any other thrown value becomes `EVALUATION_FAILED` with the original as `cause`.

## Tests

Run `testFlagAdapter` from `@priemskiyyy/prism/testing` with a fresh fixture per test. Provide `flags`, `context`, `nextContext` and `verify`, plus `cleanup` when the fixture owns a client. It identifies and reads both contexts, disposes once and checks that `identify` and `read` reject afterwards. Test your provider's change events and identify failures beside it. `createMockAdapter` from `@priemskiyyy/prism/mock` gives core and binding tests controlled identifies, reads and invalidations.
