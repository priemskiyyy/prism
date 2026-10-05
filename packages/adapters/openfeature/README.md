# @priemskiyyy/prism-openfeature

An OpenFeature server SDK client as a Prism adapter.

```ts
import { OpenFeature } from "@openfeature/server-sdk";
import { openFeature } from "@priemskiyyy/prism-openfeature";

const adapter = openFeature({
  client: OpenFeature.getClient("flags"),
  context: (context: { userId: string }) => ({ targetingKey: context.userId }),
});
```

Each read evaluates every declared key with the typed getter that matches its fallback and the mapped evaluation context, so client and provider hooks, including any exposure tracking they do, run once per key and read. Provider `Ready`, `ConfigurationChanged` and `Stale` events refresh the runtime.

The server SDK evaluates one flag per call, so a refresh costs one provider evaluation per declared flag. Pair this adapter with an in-process provider, which evaluates from a synced ruleset in memory, and use `@priemskiyyy/prism-openfeature-web` in browsers, where the provider fetches the whole flag set once per context and every read is a memory lookup. A remote-evaluation provider behind this adapter turns every refresh into one network request per flag.

OFREP backends work through this adapter with the official provider, which also carries your authentication headers:

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
