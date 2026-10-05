---
description: "Build a working React feature flag setup in five minutes: declare typed flags, register them, provide the runtime, read flags by key and switch the user, with no account or server."
---

<script setup>
import { withBase } from "vitepress";
</script>

# Getting started

This walkthrough builds a React page whose flags follow the signed-in user. It uses the memory adapter, so you need no provider account and no server. At the end you replace one line to read the same flags from your own API.

::: tip Other frameworks
Using [Vue](vue.md), [Solid](solid.md), [Svelte](svelte.md) or [React Native](react-native.md)? The runtime below is the same; each guide shows the component side.
:::

## 1. Install

::: code-group

```sh [pnpm]
pnpm add @priemskiyyy/prism @priemskiyyy/prism-react @priemskiyyy/prism-memory zod
```

```sh [npm]
npm install @priemskiyyy/prism @priemskiyyy/prism-react @priemskiyyy/prism-memory zod
```

```sh [yarn]
yarn add @priemskiyyy/prism @priemskiyyy/prism-react @priemskiyyy/prism-memory zod
```

```sh [bun]
bun add @priemskiyyy/prism @priemskiyyy/prism-react @priemskiyyy/prism-memory zod
```

:::

Zod is only an example. Any schema library that implements [Standard Schema](schemas.md) works, including Valibot, ArkType and Effect.

## 2. Declare the flags

```ts
// src/flags.ts
import { Prism, flag } from "@priemskiyyy/prism";
import { memory } from "@priemskiyyy/prism-memory";
import { z } from "zod";

type UserContext = { userId: string; plan: "free" | "pro" };

export const flags = new Prism({
  flags: {
    composer: flag(z.boolean(), { fallback: false }),
    maxUploads: flag(z.number().int().min(1), { fallback: 1 }),
    theme: flag(z.enum(["light", "dark", "system"]), { fallback: "system" }),
  },
  adapter: memory<UserContext>({
    values: (context) => ({
      composer: context.plan === "pro",
      maxUploads: context.plan === "pro" ? 20 : 3,
    }),
  }),
});

declare module "@priemskiyyy/prism-react" {
  interface Register {
    prism: typeof flags;
  }
}
```

Each flag has a schema and a fallback. The schema's output is the flag's type, so `composer` is a `boolean` and `theme` is `"light" | "dark" | "system"`. The fallback must pass the schema; a fallback that does not is a configuration error at startup.

The memory adapter answers from a function of the context. `theme` is missing from what it returns, so that flag keeps its fallback.

The `Register` block tells the React hooks which Prism the provider carries. It is what makes `useFlag("composer")` autocomplete and return a `boolean`. You write it once.

## 3. Start the runtime and provide it

```tsx
// src/main.tsx
import { PrismProvider } from "@priemskiyyy/prism-react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { flags } from "./flags";

flags
  .start({ context: { userId: "user-1", plan: "free" } })
  .catch(console.error);

const root = document.getElementById("root");

if (root !== null) {
  createRoot(root).render(
    <PrismProvider flags={flags}>
      <App />
    </PrismProvider>,
  );
}
```

`start` opens the adapter, identifies the context and reads every flag once. Creating the Prism does nothing on its own, and neither does the provider: the application decides when flags load and when they stop, with `start` and `dispose`.

You do not have to await `start`. Until the first read lands, every flag holds its fallback. The promise rejects when that read fails, so give it a `catch`; the flags keep their fallbacks and the status reports the error.

## 4. Read flags in components

```tsx
// src/App.tsx
import { useFlag, useFlagDetails, usePrism } from "@priemskiyyy/prism-react";

export const App = () => {
  const composer = useFlag("composer");
  const maxUploads = useFlag("maxUploads");
  const resolution = useFlagDetails(
    "composer",
    (details) => details.resolution,
  );
  const flags = usePrism();

  const upgrade = () => {
    flags.context({ userId: "user-1", plan: "pro" });
  };

  if (resolution === "pending") {
    return <p>Loading…</p>;
  }

  return (
    <main>
      <p>{composer ? "New composer" : "Classic composer"}</p>
      <p>Attach up to {maxUploads} files.</p>
      <button onClick={upgrade}>Upgrade to Pro</button>
    </main>
  );
};
```

`useFlag` returns the value and re-renders when it changes. A selector, like the one on `useFlagDetails`, re-renders only when the selected part changes. `usePrism` returns the instance, for switching the context or refreshing.

Press the button. `context` resets every flag to its fallback, reads again for the new context and publishes all three flags at once: the composer turns on and the upload limit becomes 20 in the same render.

## 5. Read from your own API

Replace the memory adapter with the HTTP adapter and point it at your API client:

```ts
import { http } from "@priemskiyyy/prism-http";

const adapter = http<UserContext>({
  request: async ({ context, keys, signal }) => {
    const response = await fetch("/api/flags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ context, keys }),
      signal,
    });

    return response.json();
  },
});
```

Your endpoint returns `{ "composer": { "value": true }, "maxUploads": { "value": 20 } }`. Keys it leaves out fall back. Values that fail their schema fall back too, and the flag reports why. The components do not change. [Your own API](adapters/http.md) covers the request and response in detail, and [Choose a provider](adapters.md) lists the SDK adapters.

## Next steps

- [Declaring flags](flags.md) and [schemas](schemas.md): provider keys, fallbacks, Zod, Valibot, ArkType and Effect.
- [The runtime](runtime.md): `start`, `context`, `refresh`, `dispose` and the status.
- [Flag details](details.md): loading states, variants and per-flag errors.
- [Devtools](devtools.md): inspect and override flags in the page.
- <a :href="withBase('/demo/')" target="_blank" rel="noreferrer">The live demo</a>: a multi-workspace inbox running the same flags on six providers.
