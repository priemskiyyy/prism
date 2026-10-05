# @priemskiyyy/prism-configcat

ConfigCat settings as Prism flags.

```ts
import { configcat } from "@priemskiyyy/prism-configcat";

const adapter = configcat({
  client,
  user: (context: { userId: string }) => ({ identifier: context.userId }),
});
```

The adapter waits for the client to be ready, then each read takes one snapshot and evaluates every declared key with the mapped user, which fires the client's `flagEvaluated` hook once per key. `configChanged` events refresh the runtime. ConfigCat supports boolean, number and string settings.
