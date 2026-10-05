# Documentation

Run `pnpm dev:docs` for the documentation site, or read the guides here on GitHub.

## Start here

| Guide                                 | What you will learn                               |
| ------------------------------------- | ------------------------------------------------- |
| [Getting started](getting-started.md) | Build a working React setup without an account    |
| [Installation](installation.md)       | Packages, peer versions and schema libraries      |
| [Example applications](examples.md)   | Run Courier in React, Vue, Solid, Svelte and Expo |

## Flags

| Guide                              | What it covers                                               |
| ---------------------------------- | ------------------------------------------------------------ |
| [Declaring flags](flags.md)        | `flag()`, fallbacks, provider keys and JSON values           |
| [Schemas](schemas.md)              | Zod, Valibot, ArkType and Effect, errors and transforms      |
| [The runtime](runtime.md)          | `start`, `context`, `refresh`, `dispose`, status and handles |
| [Context and identity](context.md) | Replacing the context, identify ordering and stale responses |
| [Flag details](details.md)         | Resolutions, variants, per-flag errors and exposures         |
| [Local overrides](overrides.md)    | Schema-checked local values for QA, previews and tests       |
| [Live updates](updates.md)         | Provider events, `updates`, Simulcast, polling and focus     |
| [Errors and recovery](errors.md)   | Error codes, timeouts and retrying                           |
| [TypeScript](typescript.md)        | Inference, `Register` and typed flag keys                    |

## Providers

[Choose a provider](adapters.md), then read the page for yours: [your own API](adapters/http.md), [memory](adapters/memory.md), [OpenFeature](adapters/openfeature.md), [LaunchDarkly](adapters/launchdarkly.md), [GrowthBook](adapters/growthbook.md), [Unleash](adapters/unleash.md), [Statsig](adapters/statsig.md), [PostHog](adapters/posthog.md) or [ConfigCat](adapters/configcat.md).

## Frameworks

- [React](react.md)
- [Vue](vue.md)
- [Solid](solid.md)
- [Svelte](svelte.md)
- [React Native and Expo](react-native.md)
- [Server rendering](server-rendering.md)

## Inspect, test and extend

- [Devtools](devtools.md)
- [Testing](testing.md)
- [Recipes](recipes.md)
- [Troubleshooting](troubleshooting.md)
- [API reference](api.md)
- [Writing an adapter](writing-an-adapter.md)
- [Performance](performance.md)
- [Architecture](internals/architecture.md)

## Publishing the site

The site links to the Prism repository. Configure these when you deploy it elsewhere:

| Variable              | Example                               | Purpose                                                         |
| --------------------- | ------------------------------------- | --------------------------------------------------------------- |
| `DOCS_SITE_URL`       | `https://docs.example.com/prism/`     | Public URL, for canonical links, the sitemap and social images  |
| `DOCS_BASE_PATH`      | `/prism/`                             | Asset and route prefix; defaults to the site URL's path, or `/` |
| `DOCS_REPOSITORY_URL` | `https://github.com/owner/repository` | The GitHub and edit links                                       |

```sh
pnpm lint:docs
pnpm build:docs
pnpm verify:docs
```

`build:docs` builds the site and the React example into `docs/.vitepress/dist`, with the example at `/demo/`. VitePress fails the build on a dead internal link. `verify:docs` then checks every page for a title, one heading, one main landmark, a description, Open Graph tags, working links and anchors, image alt text, `llms.txt` and the demo. The `docs` workflow runs all three on every push and deploys to GitHub Pages from `main` once Pages is enabled for the repository.
