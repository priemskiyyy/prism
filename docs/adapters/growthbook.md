---
description: "GrowthBook with Prism: attributes from the context, evalFeature for every declared key, experiment variations as variants, tracking callbacks and wiring payload updates through the renderer."
---

# GrowthBook

```sh
pnpm add @priemskiyyy/prism-growthbook @growthbook/growthbook
```

```ts
import { GrowthBook } from "@growthbook/growthbook";
import { Prism } from "@priemskiyyy/prism";
import { growthbook } from "@priemskiyyy/prism-growthbook";

const client = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey,
  trackingCallback: (experiment, result) => analytics.track(experiment, result),
});

await client.init({ streaming: true });

export const flags = new Prism({
  flags: definitions,
  adapter: growthbook({
    client,
    attributes: ({ userId, plan }: AppContext) => ({ id: userId, plan }),
  }),
  updates: (_context, refresh) => {
    client.setRenderer(refresh);

    return () => client.setRenderer(null);
  },
});
```

| Option       | Meaning                                    |
| ------------ | ------------------------------------------ |
| `client`     | Your initialized GrowthBook instance       |
| `attributes` | Maps your context to GrowthBook attributes |

## How it works

- **Identify.** Each new context sets its attributes with `setAttributes`.
- **Read.** Every declared key is evaluated with `evalFeature`. A feature GrowthBook does not know gets the `missing` resolution. When the user is in an experiment, its variation key becomes the flag's `variant`.
- **Changes.** GrowthBook reports new payloads through a single renderer slot. The adapter leaves that slot to you, because `@growthbook/growthbook-react` uses it as well. Set it in `updates`, as above. When the React SDK owns the renderer, call `flags.refresh()` wherever you apply a payload instead.

## Exposures

`evalFeature` runs the experiment logic, so a read calls your `trackingCallback` for every declared experiment the user is part of. If you track exposures only where the user sees a variation, keep experiment flags out of the declarations until they are rendered, or deduplicate in the callback.

## Lifecycle

The application owns the instance, its initialization and `destroy()`. Await `flags.dispose()` before destroying it.
