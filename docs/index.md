---
title: Prism
titleTemplate: Typed feature flags for TypeScript
description: "Typed, reactive feature flags for TypeScript. Declare each flag with a schema and a fallback, read it from React, Vue, Solid or Svelte, and switch providers without touching a component."
---

<script setup>
import { withBase } from "vitepress";
</script>

# Prism

**Typed, reactive feature flags for TypeScript.**

Declare each flag once, with a schema and a fallback. Prism reads the values from your provider, checks them against the schema and gives every component a frozen snapshot that follows the user, the workspace and the provider. React, Vue, Solid and Svelte read the same flags in their own idioms.

[Get started](getting-started.md) · <a :href="withBase('/demo/')" target="_blank" rel="noreferrer">Live demo</a> ·
[Providers](adapters.md) · [API reference](api.md) ·
[GitHub](https://github.com/priemskiyyy/prism)

```sh
pnpm add @priemskiyyy/prism@next @priemskiyyy/prism-react@next zod
```

## Declare once, read by key

::: code-group

```ts [flags.ts]
import { Prism, flag } from "@priemskiyyy/prism";
import { http } from "@priemskiyyy/prism-http";
import { z } from "zod";

export const flags = new Prism({
  flags: {
    composer: flag(z.boolean(), { fallback: false, key: "new-composer" }),
    uploads: flag(z.object({ maxFiles: z.number().int().min(1) }), {
      fallback: { maxFiles: 1 },
    }),
    layout: flag(z.enum(["classic", "split"]), { fallback: "classic" }),
  },
  adapter: http({ request: api.evaluateFlags }),
});

declare module "@priemskiyyy/prism-react" {
  interface Register {
    prism: typeof flags;
  }
}
```

```tsx [main.tsx]
import { PrismProvider } from "@priemskiyyy/prism-react";
import { flags } from "./flags";

flags.start({ context: { userId: "user-42", plan: "business" } });

createRoot(root).render(
  <PrismProvider flags={flags}>
    <Inbox />
  </PrismProvider>,
);
```

```tsx [Composer.tsx]
import { useFlag } from "@priemskiyyy/prism-react";

export const Composer = () => {
  const modern = useFlag("composer");
  const maxFiles = useFlag("uploads", (uploads) => uploads.maxFiles);

  return modern ? <RichEditor maxFiles={maxFiles} /> : <PlainEditor />;
};
```

:::

`useFlag("composer")` is a `boolean`, `useFlag("layout")` is `"classic" | "split"`, and a key that you did not declare does not compile. Until the provider answers, every flag holds its fallback, so a component never waits and never sees `undefined`.

## The same components on any provider

The provider is one line of the runtime. Components do not change when it does.

::: code-group

```ts [Your API]
import { http } from "@priemskiyyy/prism-http";

const adapter = http({
  request: ({ context, keys, signal }) =>
    api.evaluateFlags({ context, keys }, { signal }),
});
```

```ts [LaunchDarkly]
import { launchdarkly } from "@priemskiyyy/prism-launchdarkly-web";

const adapter = launchdarkly({
  client,
  context: ({ userId }) => ({ kind: "user", key: userId }),
});
```

```ts [OpenFeature]
import { OpenFeature } from "@openfeature/web-sdk";
import { openFeature } from "@priemskiyyy/prism-openfeature-web";

const adapter = openFeature({
  client: OpenFeature.getClient("flags"),
  context: ({ userId, plan }) => ({ targetingKey: userId, plan }),
});
```

```ts [GrowthBook]
import { growthbook } from "@priemskiyyy/prism-growthbook";

const adapter = growthbook({
  client,
  attributes: ({ userId, plan }) => ({ id: userId, plan }),
});
```

:::

There are adapters for your own API, OpenFeature on the server and in the browser, LaunchDarkly on the web and in React Native, GrowthBook, Unleash, Statsig, PostHog and ConfigCat. Flagsmith, DevCycle, flagd, GO Feature Flag and OFREP servers connect through OpenFeature. [Choose a provider](adapters.md).

## What every flag guarantees

- **A value of the declared type.** The fallback until the first read, the provider's value once it passes the schema, and the fallback again when the provider has nothing or sends something the schema rejects.
- **A reason for that value.** `details` says whether a flag is `pending`, `resolved`, `missing`, `error` or `override`, with the provider's variant and a `PrismError` that names the flag and the failed check.
- **Consistent batches.** A read validates every flag, installs all of them and only then notifies, so no component renders half of a context switch.
- **Stable references.** Values are frozen, and an unchanged value or branch keeps its reference, so selectors and memoized components skip work for free.
- **No stale answers.** A response for a context that was already replaced is dropped instead of committed.

## What Prism owns and what it leaves

| Prism owns                                                 | Your provider owns                  |
| ---------------------------------------------------------- | ----------------------------------- |
| Typed declarations and schema validation                   | Targeting rules, segments, rollouts |
| One frozen snapshot per flag, published in batches         | Evaluation and its caching          |
| Context switches, identify ordering and read deduplication | Streaming and polling from the SDK  |
| Status, per-flag errors and fallbacks                      | Exposure events and experiments     |
| Local overrides, devtools, framework bindings              | Its own dashboard and audit log     |

Every SDK adapter takes the client your application already created. Prism never initializes, configures or closes a provider SDK.

## When not to use it

- You read one flag in one place. The provider's SDK alone is less code.
- Each flag is checked once per request on a server and nothing subscribes to changes. A direct SDK call per request is simpler.
- Your components depend on provider features that have no equivalent elsewhere, such as per-call exposure control, in many places. There is no portability left to gain.

[Get started](getting-started.md) · <a :href="withBase('/demo/')" target="_blank" rel="noreferrer">Open the live demo</a> · [Read the architecture](internals/architecture.md)
