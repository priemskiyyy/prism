# Prism

Typed, reactive feature flags for TypeScript. Declare each flag once with a schema and a fallback, read it by key from React, Vue, Solid or Svelte, and keep the same components on your own API, OpenFeature, LaunchDarkly, GrowthBook, Unleash, Statsig, PostHog or ConfigCat.

## npm preview

The initial npm preview uses the `next` dist-tag:

```sh
pnpm add @priemskiyyy/prism@next @priemskiyyy/prism-react@next @priemskiyyy/prism-http@next zod
```

The preview includes the core, React, Vue, Solid and Svelte bindings, and the
HTTP and memory adapters. The other adapters and devtools are available as
source while release verification continues. The API may change during the
preview.

```ts
import { Prism, flag } from "@priemskiyyy/prism";
import { http } from "@priemskiyyy/prism-http";
import { z } from "zod";

export const flags = new Prism({
  flags: {
    composer: flag(z.boolean(), { fallback: false, key: "new-composer" }),
    uploads: flag(z.object({ maxFiles: z.number().int().min(1) }), {
      fallback: { maxFiles: 1 },
    }),
  },
  adapter: http({ request: api.evaluateFlags }),
});

declare module "@priemskiyyy/prism-react" {
  interface Register {
    prism: typeof flags;
  }
}
```

```tsx
import { PrismProvider, useFlag } from "@priemskiyyy/prism-react";

flags.start({ context: { userId: "user-42", plan: "business" } });

root.render(
  <PrismProvider flags={flags}>
    <Composer />
  </PrismProvider>,
);

const Composer = () => {
  const modern = useFlag("composer");
  const maxFiles = useFlag("uploads", (uploads) => uploads.maxFiles);

  return modern ? <RichEditor maxFiles={maxFiles} /> : <PlainEditor />;
};
```

`useFlag("composer")` is a `boolean`, and a key you did not declare does not compile. Every flag holds its fallback until the provider answers, and keeps it when the provider has nothing or sends a value the schema rejects. A read validates every flag, installs them all and only then notifies, so a context switch is one render. Values are frozen and keep their references while they are equal.

## Documentation

The [documentation](docs/README.md) covers everything in detail:

- [Getting started](docs/getting-started.md), [installation](docs/installation.md) and the [example applications](docs/examples.md)
- [Declaring flags](docs/flags.md) and [schemas](docs/schemas.md) with Zod, Valibot, ArkType and Effect
- [The runtime](docs/runtime.md), [context and identity](docs/context.md), [flag details](docs/details.md), [overrides](docs/overrides.md), [live updates](docs/updates.md) and [errors](docs/errors.md)
- [Every provider](docs/adapters.md) and [every framework](docs/react.md), including [React Native](docs/react-native.md) and [server rendering](docs/server-rendering.md)
- [Devtools](docs/devtools.md), [testing](docs/testing.md), [recipes](docs/recipes.md), [troubleshooting](docs/troubleshooting.md) and the [API reference](docs/api.md)

Run `pnpm dev:docs` to browse it as a site.

## Packages

| Package                                        | Responsibility                                                |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `@priemskiyyy/prism`                           | The dependency-free core, with `/mock` and `/testing` entries |
| `@priemskiyyy/prism-react`                     | Provider and hooks for React and React Native                 |
| `@priemskiyyy/prism-vue`                       | Provider and composables                                      |
| `@priemskiyyy/prism-solid`                     | Provider and primitives                                       |
| `@priemskiyyy/prism-svelte`                    | Context and stores                                            |
| `@priemskiyyy/prism-devtools`                  | An in-page inspector with overrides and a timeline            |
| `@priemskiyyy/prism-http`                      | Flags from your own API client                                |
| `@priemskiyyy/prism-memory`                    | Values from a function, for tests and demos                   |
| `@priemskiyyy/prism-simulcast`                 | Refresh on Simulcast publications and reconnects              |
| `@priemskiyyy/prism-openfeature`               | The OpenFeature server SDK                                    |
| `@priemskiyyy/prism-openfeature-web`           | The OpenFeature web SDK and every browser provider            |
| `@priemskiyyy/prism-launchdarkly-web`          | The LaunchDarkly browser SDK                                  |
| `@priemskiyyy/prism-launchdarkly-react-native` | The LaunchDarkly React Native SDK                             |
| `@priemskiyyy/prism-growthbook`                | GrowthBook features and experiments                           |
| `@priemskiyyy/prism-unleash`                   | Unleash toggles, variants and payloads                        |
| `@priemskiyyy/prism-statsig`                   | Statsig gates and config, experiment and layer parameters     |
| `@priemskiyyy/prism-posthog`                   | PostHog flags, variants and payloads for one identity         |
| `@priemskiyyy/prism-configcat`                 | The ConfigCat client                                          |

Flagsmith, DevCycle, flagd, GO Feature Flag and OFREP servers connect through the OpenFeature web adapter. Every SDK adapter takes a client your application created; Prism never initializes or closes a provider SDK.

## Development

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

`pnpm dev` opens Courier, a multi-workspace inbox that runs the same flags on six providers inside the page, with a lab for latency, outages and bad payloads. `pnpm dev:docs` serves the documentation, and `pnpm dev:server` starts the fixture server the Expo example reads from. See the [examples](examples/README.md), the [architecture](docs/internals/architecture.md), [writing an adapter](docs/writing-an-adapter.md) and [contributing](CONTRIBUTING.md).

MIT licensed.
