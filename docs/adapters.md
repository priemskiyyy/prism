---
description: "Compare every Prism adapter: your own API, memory, OpenFeature, LaunchDarkly, GrowthBook, Unleash, Statsig, PostHog and ConfigCat, with how each identifies users, reports changes, names variants and records exposures."
---

<script setup>
import { withBase } from "vitepress";
</script>

# Choose a provider

An adapter connects the runtime to one flag provider. Your components never see it: they read flags by key, and the adapter decides how to ask the provider. Changing providers changes one line where the runtime is created.

| Provider                                             | Package                                                | Context goes to    | Refreshes on                | Records on read         |
| ---------------------------------------------------- | ------------------------------------------------------ | ------------------ | --------------------------- | ----------------------- |
| [Your API](adapters/http.md)                         | `@priemskiyyy/prism-http`                              | Every request      | `updates`, `refresh()`      | What your API records   |
| [Memory](adapters/memory.md)                         | `@priemskiyyy/prism-memory`                            | Your function      | `refresh()`                 | Nothing                 |
| [OpenFeature, server](adapters/openfeature.md)       | `@priemskiyyy/prism-openfeature`                       | Every evaluation   | Provider events             | Hooks run per key       |
| [OpenFeature, web](adapters/openfeature.md#browsers) | `@priemskiyyy/prism-openfeature-web`                   | The domain context | Provider events             | Hooks run per key       |
| [LaunchDarkly](adapters/launchdarkly.md)             | `@priemskiyyy/prism-launchdarkly-web`, `-react-native` | `identify`         | `change`                    | Nothing                 |
| [GrowthBook](adapters/growthbook.md)                 | `@priemskiyyy/prism-growthbook`                        | `setAttributes`    | `updates` with the renderer | Experiment exposures    |
| [Unleash](adapters/unleash.md)                       | `@priemskiyyy/prism-unleash`                           | `updateContext`    | `update`                    | Nothing                 |
| [Statsig](adapters/statsig.md)                       | `@priemskiyyy/prism-statsig`                           | `updateUserAsync`  | `values_updated`            | Nothing                 |
| [PostHog](adapters/posthog.md)                       | `@priemskiyyy/prism-posthog`                           | Checked, never set | Flag reloads                | Nothing                 |
| [ConfigCat](adapters/configcat.md)                   | `@priemskiyyy/prism-configcat`                         | Every evaluation   | `configChanged`             | `flagEvaluated` per key |

Flagsmith, DevCycle, flagd, GO Feature Flag and any OFREP server have OpenFeature providers and connect through [OpenFeature](adapters/openfeature.md). A provider that has neither is an adapter of about forty lines; see [Writing an adapter](writing-an-adapter.md).

## Rules every adapter follows

- **Your application owns the SDK.** Every SDK adapter takes a `client` you created. You initialize it, configure streaming or polling, and close it. Await `flags.dispose()` before you close the client.
- **The context is mapped by you.** Each adapter takes a function from your context to what the SDK expects: a LaunchDarkly context, Statsig user, GrowthBook attributes, an OpenFeature evaluation context. Your context type follows from that function.
- **Reads are pure reads.** A read asks for every declared key, returns what the provider has, and leaves out what it does not. Values are validated by the runtime, not by the adapter.
- **Missing is not an error.** A key the provider does not know becomes the `missing` resolution. A provider error for one key becomes that flag's `error`. A failure of the whole read fails the read.
- **Exposures are your call.** Where the SDK allows it, reads record nothing, so a flag you declared but did not render does not count as an exposure. The table says where the SDK records anyway.

## Resources

Some providers do not map one flag to one value. A Statsig experiment has many parameters, and a PostHog or Unleash flag has an enabled state, a variant and a payload. Their adapters take `resources`, which say what each of your keys reads:

```ts
statsig({
  client,
  user: ({ userId }) => ({ userID: userId }),
  resources: {
    composer: { type: "gate", name: "new_composer" },
    maxFiles: { type: "experiment", name: "uploads", parameter: "max_files" },
  },
});
```

A declared flag without a resource fails the read with `INVALID_CONFIGURATION`, so a typo is found on the first read instead of being a silent fallback.

## Switching providers

Nothing but the adapter changes. The definitions, the context shape and every component stay the same, as long as the provider knows the same keys. When the new provider names flags differently, set `key` on the declarations, or map names in `resources`. The Courier example runs one page on six providers this way; <a :href="withBase('/demo/')" target="_blank" rel="noreferrer">try it in the live demo</a>.
