---
description: "The memory adapter: flag values from a function of the context, for examples, prototypes, stories and tests, with deterministic reads and refresh()."
---

# Memory

`@priemskiyyy/prism-memory` answers from a function you write. It needs no network and no account, which makes it the adapter for tests, stories, prototypes and demos.

```sh
pnpm add @priemskiyyy/prism @priemskiyyy/prism-memory
```

```ts
import { Prism, flag } from "@priemskiyyy/prism";
import { memory } from "@priemskiyyy/prism-memory";
import { z } from "zod";

type AppContext = { userId: string; plan: "free" | "pro" };

export const flags = new Prism({
  flags: {
    composer: flag(z.boolean(), { fallback: false }),
    maxUploads: flag(z.number().int(), { fallback: 1 }),
  },
  adapter: memory<AppContext>({
    values: (context) => ({
      composer: context.plan === "pro",
      maxUploads: context.plan === "pro" ? 20 : 3,
    }),
  }),
});
```

`values` maps a context to a record of values keyed by provider key, and runs on every read. Keys it leaves out get the `missing` resolution. Values still go through their schemas, so a memory adapter catches the same validation mistakes a real provider would.

## Changing values

The adapter has no change events. Change what `values` returns, then call `refresh()`:

```ts
import type { JsonValue } from "@priemskiyyy/prism";

const overrides = new Map<string, JsonValue>();

const adapter = memory<AppContext>({
  values: (context) => ({
    ...defaultsFor(context),
    ...Object.fromEntries(overrides),
  }),
});

overrides.set("composer", true);
await flags.refresh();
```

For one-off changes in tests, a [local override](../overrides.md) is simpler.

## When to use it

- Unit and component tests that need specific flag values.
- Storybook stories and design reviews.
- Local development before the provider is set up.
- Demos that must not depend on an account, like the [examples](../examples.md).

For tests that need to control timing, such as a slow first read or a failed identify, use `createMockAdapter` instead; see [Testing](../testing.md).
