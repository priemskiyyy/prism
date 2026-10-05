# @priemskiyyy/prism-growthbook

GrowthBook features as Prism flags.

```ts
import { GrowthBook } from "@growthbook/growthbook";
import { growthbook } from "@priemskiyyy/prism-growthbook";

const client = new GrowthBook({ apiHost, clientKey });
await client.init({ streaming: true });
const adapter = growthbook({
  client,
  attributes: (context: { userId: string }) => ({ id: context.userId }),
});
```

The adapter sets the mapped attributes for each new context and evaluates every declared key with `evalFeature`; an experiment's variation key becomes the flag's `variant`. `evalFeature` fires the client's tracking callback for every declared experiment the user is in, so reads log those exposures. The application owns the client, its initialization and `destroy`.

GrowthBook reports payload changes only through its single renderer slot, which `@growthbook/growthbook-react` also uses, so the adapter leaves it alone. Wire refreshes through the runtime's `updates` option:

```ts
const flags = new Prism({
  adapter,
  flags: schema,
  updates: (_context, refresh) => {
    client.setRenderer(refresh);
    return () => client.setRenderer(null);
  },
});
```

When the React SDK owns the renderer, call `flags.refresh()` wherever you apply a new payload instead.
