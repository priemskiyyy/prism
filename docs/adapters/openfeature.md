---
description: "Use any OpenFeature provider with Prism: the server SDK adapter, the web SDK adapter, Flagsmith, DevCycle, flagd, GO Feature Flag, OFREP and how typed getters, contexts and events map."
---

# OpenFeature

[OpenFeature](https://openfeature.dev) is the vendor-neutral standard for feature flag SDKs. Prism has one adapter for the server SDK and one for the web SDK, and through them every OpenFeature provider: Flagsmith, DevCycle, flagd, GO Feature Flag, OFREP servers, and the vendors that also have dedicated adapters.

## Browsers

```sh
pnpm add @priemskiyyy/prism-openfeature-web @openfeature/web-sdk
```

```ts
import { OpenFeature } from "@openfeature/web-sdk";
import { openFeature } from "@priemskiyyy/prism-openfeature-web";

await OpenFeature.setProviderAndWait("flags", provider);

const adapter = openFeature({
  client: OpenFeature.getClient("flags"),
  context: ({ userId, plan }: AppContext) => ({ targetingKey: userId, plan }),
});
```

| Option    | Meaning                                                |
| --------- | ------------------------------------------------------ |
| `client`  | An OpenFeature web client, ideally for its own domain  |
| `context` | Maps your context to an OpenFeature evaluation context |

The web SDK evaluates against one context per domain. The adapter sets each new context on the client's domain and waits for the provider to reconcile, which is when most providers fetch the flags for that user. A provider that ends up in the `ERROR` state fails the read with `EVALUATION_FAILED`, and the next read retries.

Give the client a [domain](https://openfeature.dev/docs/reference/concepts/domain), such as `"flags"` above. Without one, the adapter sets the global context, which other clients in the page share.

## Servers

```sh
pnpm add @priemskiyyy/prism-openfeature @openfeature/server-sdk
```

```ts
import { OpenFeature } from "@openfeature/server-sdk";
import { openFeature } from "@priemskiyyy/prism-openfeature";

const adapter = openFeature({
  client: OpenFeature.getClient("flags"),
  context: ({ userId }: AppContext) => ({ targetingKey: userId }),
});
```

The server SDK takes the context on every evaluation, so identifying is instant and several runtimes, one per request, can share one client. A read evaluates one flag per call. Pair it with an in-process provider that evaluates from a ruleset in memory, such as flagd in-process mode; behind a remote-evaluation provider every refresh becomes one network request per declared flag.

## How values map

Each read evaluates every declared key with the typed getter that matches its fallback:

| Fallback                | Getter              |
| ----------------------- | ------------------- |
| `boolean`               | `getBooleanDetails` |
| `number`                | `getNumberDetails`  |
| `string`                | `getStringDetails`  |
| object, array or `null` | `getObjectDetails`  |

| OpenFeature result                         | Prism                                     |
| ------------------------------------------ | ----------------------------------------- |
| A value with a reason                      | `resolved`, with the provider's `variant` |
| `FLAG_NOT_FOUND`                           | `missing`                                 |
| Reason `DEFAULT` or `DISABLED`             | `missing`, so your fallback wins          |
| `PARSE_ERROR`, `TYPE_MISMATCH`             | `error` with `VALIDATION`                 |
| `TARGETING_KEY_MISSING`, `INVALID_CONTEXT` | `error` with `INVALID_CONTEXT`            |
| Any other error code                       | `error` with `EVALUATION_FAILED`          |

Provider `Ready`, `ConfigurationChanged` and `Stale` events refresh the runtime. Hooks, including any exposure tracking they do, run once per key and read.

## Providers

Install `@openfeature/web-sdk`, the provider and, where it needs one, the vendor SDK. Register the provider once at startup:

::: code-group

```ts [Flagsmith]
import { FlagsmithClientProvider } from "@openfeature/flagsmith-client-provider";

await OpenFeature.setProviderAndWait(
  "flags",
  new FlagsmithClientProvider({ environmentID: "your-environment-id" }),
);
```

```ts [flagd]
import { FlagdWebProvider } from "@openfeature/flagd-web-provider";

await OpenFeature.setProviderAndWait(
  "flags",
  new FlagdWebProvider({ host: "flags.example.com", tls: true }),
);
```

```ts [OFREP]
import { OFREPWebProvider } from "@openfeature/ofrep-web-provider";

await OpenFeature.setProviderAndWait(
  "flags",
  new OFREPWebProvider({ baseUrl: "https://flags.example.com" }),
);
```

:::

| Provider        | Package                                     |
| --------------- | ------------------------------------------- |
| Flagsmith       | `@openfeature/flagsmith-client-provider`    |
| DevCycle        | `@devcycle/openfeature-web-provider`        |
| flagd           | `@openfeature/flagd-web-provider`           |
| GO Feature Flag | `@openfeature/go-feature-flag-web-provider` |
| OFREP servers   | `@openfeature/ofrep-web-provider`           |
| ConfigCat       | `@openfeature/config-cat-web-provider`      |
| GrowthBook      | `@openfeature/growthbook-client-provider`   |
| LaunchDarkly    | `@openfeature/launchdarkly-client-provider` |
| Unleash         | `@openfeature/unleash-web-provider`         |

Package names follow the OpenFeature contrib repository; check each provider's documentation for its options. ConfigCat, GrowthBook, LaunchDarkly and Unleash also have dedicated Prism adapters that use the vendor SDK directly. Prefer those when you use one vendor, and OpenFeature when you want one integration point or a provider without its own adapter.

For OFREP on a server, the official provider carries your authentication headers:

```ts
import { OFREPProvider } from "@openfeature/ofrep-provider";

await OpenFeature.setProviderAndWait(
  "flags",
  new OFREPProvider({
    baseUrl: "https://flags.example.com",
    headers: [["authorization", `Bearer ${token}`]],
  }),
);
```
