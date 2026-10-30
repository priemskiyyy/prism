---
description: "Every Prism package, what it needs and which versions of React, Vue, Solid, Svelte and each provider SDK it supports."
---

# Installation

The initial npm preview includes the core, framework bindings, HTTP and memory
adapters. Install these packages with `@next`. See the
[preview package list](https://github.com/priemskiyyy/prism#npm-preview) for the
current release scope. Other packages described here remain in development.

Prism is split into a dependency-free core, one binding per framework and one adapter per provider. Install the core, the binding for your framework and the adapter for your provider. Your schema library is your choice.

```sh
pnpm add @priemskiyyy/prism@next @priemskiyyy/prism-react@next @priemskiyyy/prism-http@next zod
```

All packages are ESM only and ship their own type declarations.

## Requirements

| Tool       | Version                                                      |
| ---------- | ------------------------------------------------------------ |
| TypeScript | 5.4 or newer, for `NoInfer` in the declarations              |
| Node.js    | 22.18 or newer when the runtime runs on a server or in tests |
| Bundler    | Any ESM bundler: Vite, Metro, webpack, Rollup, esbuild       |

The core has no dependencies. The `@priemskiyyy/prism/testing` entry needs Vitest 4 as a peer, and nothing else imports it.

## Core

| Package                      | Contents                                                                 |
| ---------------------------- | ------------------------------------------------------------------------ |
| `@priemskiyyy/prism`         | `Prism`, `flag`, `PrismError`, `createFlagAdapter` and every public type |
| `@priemskiyyy/prism/mock`    | `createMockAdapter`, an adapter you drive by hand in tests               |
| `@priemskiyyy/prism/testing` | `testFlagAdapter`, the conformance suite for adapter authors             |

## Framework bindings

| Package                     | Framework | Peer range     | Reads flags with       |
| --------------------------- | --------- | -------------- | ---------------------- |
| `@priemskiyyy/prism-react`  | React, RN | `>=18.2.0 <20` | [Hooks](react.md)      |
| `@priemskiyyy/prism-vue`    | Vue       | `>=3.5.0 <4`   | [Composables](vue.md)  |
| `@priemskiyyy/prism-solid`  | Solid     | `>=1.8.0 <2`   | [Primitives](solid.md) |
| `@priemskiyyy/prism-svelte` | Svelte    | `>=5.0.0 <6`   | [Stores](svelte.md)    |

The React binding also works in React Native and Expo. See [React Native and Expo](react-native.md).

## Providers

Each SDK adapter lists the SDK as a peer dependency. Install the SDK yourself, at a version inside the range.

| Package                                        | Provider SDK                            | Peer range      |
| ---------------------------------------------- | --------------------------------------- | --------------- |
| `@priemskiyyy/prism-http`                      | Your own API client                     | none            |
| `@priemskiyyy/prism-memory`                    | None, values from a function            | none            |
| `@priemskiyyy/prism-openfeature`               | `@openfeature/server-sdk`               | `^1.23.0`       |
| `@priemskiyyy/prism-openfeature-web`           | `@openfeature/web-sdk`                  | `^1.10.0`       |
| `@priemskiyyy/prism-launchdarkly-web`          | `@launchdarkly/js-client-sdk`           | `>=4.10.2 <5`   |
| `@priemskiyyy/prism-launchdarkly-react-native` | `@launchdarkly/react-native-client-sdk` | `>=10.20.2 <11` |
| `@priemskiyyy/prism-growthbook`                | `@growthbook/growthbook`                | `^1.7.0`        |
| `@priemskiyyy/prism-unleash`                   | `unleash-proxy-client`                  | `^3.8.2`        |
| `@priemskiyyy/prism-statsig`                   | `@statsig/js-client`                    | `^3.33.5`       |
| `@priemskiyyy/prism-posthog`                   | `posthog-js`                            | `^1.434.7`      |
| `@priemskiyyy/prism-configcat`                 | `@configcat/sdk`                        | `^1.1.0`        |

Providers without their own adapter, such as Flagsmith, DevCycle, flagd, GO Feature Flag or any OFREP server, connect through an OpenFeature provider. See [OpenFeature](adapters/openfeature.md).

## Integrations and tools

| Package                        | What it adds                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `@priemskiyyy/prism-simulcast` | Refreshes flags when a [Simulcast](https://github.com/priemskiyyy/simulcast) channel says they changed |
| `@priemskiyyy/prism-devtools`  | An in-page panel to inspect and override flags, with a React wrapper                                   |

## Schema libraries

A flag's schema can come from any library that implements [Standard Schema](https://standardschema.dev) and validates synchronously. Nothing in Prism depends on one.

| Library | Install   | Notes                                                 |
| ------- | --------- | ----------------------------------------------------- |
| Zod     | `zod`     | Version 3.24 or newer, including Zod 4 and `zod/mini` |
| Valibot | `valibot` | Version 1.0 or newer                                  |
| ArkType | `arktype` | Version 2.0 or newer                                  |
| Effect  | `effect`  | Wrap schemas with `Schema.standardSchemaV1`           |

Yup implements Standard Schema with asynchronous validation only, which flags cannot use. [Schemas](schemas.md) shows each library side by side.
