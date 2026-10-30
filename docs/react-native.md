---
description: "Feature flags in React Native and Expo with Prism: the React binding, reading flags over HTTP, refreshing on foreground and pull-to-refresh, LaunchDarkly mobile and physical-device setup."
---

# React Native and Expo

React Native uses the React binding, `@priemskiyyy/prism-react`, with no changes. Everything on the [React page](react.md) applies: register, provide, read by key.

```sh
pnpm add @priemskiyyy/prism@next @priemskiyyy/prism-react@next @priemskiyyy/prism-http@next zod
```

## A complete setup

```ts
// src/flags/flags.ts
import { Prism } from "@priemskiyyy/prism";
import { http } from "@priemskiyyy/prism-http";
import { definitions } from "./definitions";

export const flags = new Prism({
  flags: definitions,
  adapter: http({
    request: ({ context, keys, signal }) =>
      api.evaluateFlags({ context, keys }, { signal }),
  }),
});
```

```tsx
// index.tsx
import { registerRootComponent } from "expo";
import { AppState } from "react-native";
import { PrismProvider } from "@priemskiyyy/prism-react";
import { flags } from "./src/flags/flags";

flags.start({ context: { userId: "anonymous" } }).catch(reportError);

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    flags.refresh().catch(reportError);
  }
});

const Root = () => (
  <PrismProvider flags={flags}>
    <Application />
  </PrismProvider>
);

registerRootComponent(Root);
```

Refreshing when the app returns to the foreground is the mobile equivalent of a change stream: a phone may sleep for hours, and one read on wake is cheaper than a socket kept open.

## Pull to refresh

```tsx
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { usePrism } from "@priemskiyyy/prism-react";

export const Inbox = () => {
  const flags = usePrism();
  const [pulling, setPulling] = useState(false);

  const handleRefresh = () => {
    setPulling(true);
    flags
      .refresh()
      .catch(reportError)
      .finally(() => setPulling(false));
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={pulling} onRefresh={handleRefresh} />
      }
    >
      <Conversations />
    </ScrollView>
  );
};
```

`refresh()` resolves once a read that started after the pull has been applied, so the spinner stops exactly when the new values are on screen.

## Providers on mobile

| Provider     | Package                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| Your API     | `@priemskiyyy/prism-http`                                                        |
| LaunchDarkly | `@priemskiyyy/prism-launchdarkly-react-native`                                   |
| OpenFeature  | `@priemskiyyy/prism-openfeature-web`, with a provider that supports React Native |

The HTTP adapter uses the `fetch` you give it, which React Native provides. See [LaunchDarkly](adapters/launchdarkly.md#react-native) for the mobile SDK.

## Running against a local server

A phone cannot reach `localhost` on your computer. Point the app at your machine's LAN address:

```sh
EXPO_PUBLIC_FLAGS_URL=http://192.168.1.20:4318/api/flags pnpm expo start
```

The Expo example in the repository reads its flags this way from `examples/server`, a fixture server whose rules you can change with `curl` while the app is open. See [Example applications](examples.md#the-expo-app-and-the-fixture-server).
