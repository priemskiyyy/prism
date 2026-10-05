# @priemskiyyy/prism-statsig

Statsig gates and config, experiment and layer parameters as Prism flags.

```ts
import { statsig } from "@priemskiyyy/prism-statsig";

const adapter = statsig({
  client,
  user: (context: { userId: string }) => ({ userID: context.userId }),
  resources: {
    composer: { type: "gate", name: "new_composer" },
    uploadLimit: {
      type: "experiment",
      name: "uploads",
      parameter: "max_files",
    },
  },
});
```

`resources` is keyed by flag key. The adapter calls `updateUserAsync` for each new context and reads with `disableExposureLog`, so reads log no exposures; check the gate or experiment through the client where the user sees it to log one. `values_updated` events refresh the runtime. The application initializes and shuts down the client.
