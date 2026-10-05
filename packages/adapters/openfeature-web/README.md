# @priemskiyyy/prism-openfeature-web

An OpenFeature web SDK client as a Prism adapter. This is the package to reach for when your provider has no dedicated Prism adapter: any browser provider in the OpenFeature ecosystem plugs in here.

```ts
import { OpenFeature } from "@openfeature/web-sdk";
import { openFeature } from "@priemskiyyy/prism-openfeature-web";

await OpenFeature.setProviderAndWait("flags", provider);
const adapter = openFeature({
  client: OpenFeature.getClient("flags"),
  context: (context: { userId: string }) => ({ targetingKey: context.userId }),
});
```

The web SDK evaluates against one context per domain, so the adapter sets each new context on the client's domain and waits for the provider to reconcile. A provider that fails to apply the context fails the read, and the next read retries it. Each read evaluates every declared key with the typed getter that matches its fallback, so client and provider hooks, including any exposure tracking they do, run once per key and read. Provider `Ready`, `ConfigurationChanged` and `Stale` events refresh the runtime. The application owns the provider, its initialization and its authentication.

## Setting up a provider

Install `@openfeature/web-sdk`, the provider package and, where the provider needs it, the vendor SDK. Register the provider once at startup, then hand the client to the adapter. Flagsmith as a worked example:

```ts
import { z } from "zod";
import { OpenFeature } from "@openfeature/web-sdk";
import { FlagsmithClientProvider } from "@openfeature/flagsmith-client-provider";
import { Prism, flag } from "@priemskiyyy/prism";
import { openFeature } from "@priemskiyyy/prism-openfeature-web";

await OpenFeature.setProviderAndWait(
  "flags",
  new FlagsmithClientProvider({ environmentID: "your-environment-id" }),
);

const flags = new Prism({
  flags: {
    composer: flag(z.boolean(), { fallback: false }),
    uploadLimit: flag(z.number(), { fallback: 5 }),
  },
  adapter: openFeature({
    client: OpenFeature.getClient("flags"),
    context: (context: { userId: string; plan: string }) => ({
      targetingKey: context.userId,
      plan: context.plan,
    }),
  }),
});

await flags.start({ context: { userId: "user-42", plan: "pro" } });
```

The `context` mapper returns an OpenFeature evaluation context. `targetingKey` is the identity most providers key on; the other attributes become targeting traits, and each provider documents how it maps them.

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

Package names follow the OpenFeature contrib repository; check the registry for the current version. ConfigCat, GrowthBook, LaunchDarkly and Unleash also have dedicated Prism adapters that use the vendor SDK directly; prefer those when you use only one of them, and this adapter when you want one integration surface or a provider without its own adapter.

## Realtime

Providers that stream changes raise `ConfigurationChanged` and the runtime refreshes. Providers that poll raise it on each fetch that changed something. Anything else can be wired through the runtime's `updates` option, like any other adapter.
