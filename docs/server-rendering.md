---
description: "Server rendering with Prism: one runtime per request, rendering with started flags, passing values to the client, hydration without flicker and cleaning up."
---

# Server rendering

On a server, many users share one process. Create a Prism per request, start it with that request's context, render, and dispose it:

```tsx
import { renderToString } from "react-dom/server";
import { PrismProvider } from "@priemskiyyy/prism-react";

app.get("*", async (request, response) => {
  const flags = createFlags();

  try {
    await flags.start({ context: await getContext(request) });

    const html = renderToString(
      <PrismProvider flags={flags}>
        <App />
      </PrismProvider>,
    );

    response.send(renderPage(html, snapshot(flags)));
  } finally {
    await flags.dispose();
  }
});
```

`createFlags` is a function that returns `new Prism({ ... })` with a server adapter, such as [OpenFeature](adapters/openfeature.md#servers) with an in-process provider, or [your own API](adapters/http.md) called from the server. Awaiting `start` means the page renders with resolved values instead of fallbacks.

Never share one runtime between requests. A context switch in one request would reset the flags another request is rendering.

## Hooks on the server

During server rendering, `useFlag`, `useFlagDetails` and `usePrismStatus` read the current snapshot and never subscribe, in every binding. Nothing needs to be cleaned up after a render besides the runtime itself.

## Hydration

The client renders again with its own runtime. If that runtime starts with fallbacks while the server rendered resolved values, the first client render differs from the HTML. Send the server's values along and install them as the client's starting point:

```ts
import type { FlagKey, Prism } from "@priemskiyyy/prism";

const FLAG_KEYS: FlagKey<typeof definitions>[] = ["composer", "layout"];

const snapshot = (flags: Prism<typeof definitions, AppContext>) =>
  Object.fromEntries(FLAG_KEYS.map((key) => [key, flags.flag(key).get()]));
```

On the client, override each flag with the server's value until the live read lands. Overrides made before `start` survive the first read:

```ts
const releases = FLAG_KEYS.map((key) => flags.flag(key).override(initial[key]));

flags.start({ context }).then(() => {
  for (const release of releases) {
    release();
  }
});
```

The first client render then matches the server's HTML. When exact hydration does not matter, rendering a skeleton while `resolution` is `pending` is simpler still.

## Static pages

A page built ahead of time has no request context. Render it with the fallbacks, which are valid values by definition, and let the client read the real flags after hydration.
