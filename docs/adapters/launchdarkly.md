---
description: "LaunchDarkly with Prism on the web and in React Native: application-owned clients, identify with secure mode hashes, multi-contexts, change events and how exposures are recorded."
---

# LaunchDarkly

Two packages, one for each LaunchDarkly client SDK:

| Package                                        | SDK                                          |
| ---------------------------------------------- | -------------------------------------------- |
| `@priemskiyyy/prism-launchdarkly-web`          | `@launchdarkly/js-client-sdk` 4.x            |
| `@priemskiyyy/prism-launchdarkly-react-native` | `@launchdarkly/react-native-client-sdk` 10.x |

## Web

```sh
pnpm add @priemskiyyy/prism-launchdarkly-web @launchdarkly/js-client-sdk
```

```ts
import { createClient } from "@launchdarkly/js-client-sdk";
import { launchdarkly } from "@priemskiyyy/prism-launchdarkly-web";

const client = createClient(clientSideId, { kind: "user", key: "anonymous" });

await client.start();

const adapter = launchdarkly({
  client,
  context: ({ userId, workspaceId }: AppContext) => ({
    kind: "multi",
    user: { key: userId },
    organization: { key: workspaceId },
  }),
  hash: (context) => api.launchDarklyHash(context),
});
```

| Option    | Meaning                                                                    |
| --------- | -------------------------------------------------------------------------- |
| `client`  | Your started LaunchDarkly client                                           |
| `context` | Maps your context to an `LDContext`, a single kind or a multi-context      |
| `hash`    | Optional. Returns the secure mode hash for a context, synchronously or not |

## React Native

```sh
pnpm add @priemskiyyy/prism-launchdarkly-react-native @launchdarkly/react-native-client-sdk
```

```ts
import {
  AutoEnvAttributes,
  ReactNativeLDClient,
} from "@launchdarkly/react-native-client-sdk";
import { launchdarkly } from "@priemskiyyy/prism-launchdarkly-react-native";

const client = new ReactNativeLDClient(mobileKey, AutoEnvAttributes.Enabled);

const adapter = launchdarkly({
  client,
  context: ({ userId }: AppContext) => ({ kind: "user", key: userId }),
});
```

The React Native adapter has no `hash` option, because mobile keys do not use secure mode.

## How it works

- **Identify.** Each new context is identified with `noTimeout` and `sheddable: false`, so a context switch is never dropped by the SDK. An identify that ends as `error`, `timeout` or `shed` fails its read with `EVALUATION_FAILED` or `TIMEOUT`, and the next read retries it.
- **Read.** A read takes `allFlags()` and picks the declared keys. Keys LaunchDarkly does not serve get the `missing` resolution. LaunchDarkly reports no variant through `allFlags()`.
- **Changes.** The SDK's `change` event refreshes the runtime, whether it streams or polls.

## Exposures

`allFlags()` sends no evaluation events, so reads never count a user as exposed, and flags you declared but did not render stay out of experiment results. Call a variation method where the user sees the flag to record the exposure:

```ts
const composer = useFlag("composer");

useEffect(() => {
  client.variation("new-composer", false);
}, []);
```

## Lifecycle

The application starts the client and closes it. Dispose the runtime first, so no identify is left running:

```ts
await flags.dispose();
await client.close();
```
