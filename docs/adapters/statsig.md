---
description: "Statsig with Prism: gates and dynamic config, experiment and layer parameters as typed flags, user updates, group names as variants and reads without exposure logging."
---

# Statsig

```sh
pnpm add @priemskiyyy/prism-statsig @statsig/js-client
```

```ts
import { StatsigClient } from "@statsig/js-client";
import { statsig } from "@priemskiyyy/prism-statsig";

const client = new StatsigClient(clientKey, { userID: "anonymous" });

await client.initializeAsync();

const adapter = statsig({
  client,
  user: ({ userId, plan }: AppContext) => ({
    userID: userId,
    custom: { plan },
  }),
  resources: {
    composer: { type: "gate", name: "new_composer" },
    maxFiles: { type: "experiment", name: "uploads", parameter: "max_files" },
    theme: { type: "config", name: "appearance", parameter: "theme" },
    ranking: { type: "layer", name: "inbox", parameter: "ranking" },
  },
});
```

| Option      | Meaning                                                                        |
| ----------- | ------------------------------------------------------------------------------ |
| `client`    | Your initialized `StatsigClient`                                               |
| `user`      | Maps your context to a `StatsigUser`                                           |
| `resources` | For each flag key, the gate, or the parameter of a config, experiment or layer |

## Resources

| `type`       | Value                             | `variant`             |
| ------------ | --------------------------------- | --------------------- |
| `gate`       | The gate's boolean                | none                  |
| `config`     | One parameter of a dynamic config | none                  |
| `experiment` | One parameter of an experiment    | the user's group name |
| `layer`      | One parameter of a layer          | the user's group name |

Each parameter is its own flag with its own schema, so an experiment with three parameters becomes three typed flags. A resource Statsig does not recognize for the user, and a parameter the object does not have, get the `missing` resolution. A flag without a resource fails the read with `INVALID_CONFIGURATION`.

## How it works

- **Identify.** Each new context calls `updateUserAsync`, which fetches values for that user.
- **Read.** Every resource is read with `disableExposureLog`, so reads log no exposures.
- **Changes.** `values_updated` events refresh the runtime.

## Exposures

Check the gate or read the experiment through the client where the user sees it:

```ts
client.checkGate("new_composer");
client.getExperiment("uploads").get("max_files", 3);
```

## Lifecycle

The application initializes and shuts down the client. Await `flags.dispose()` before `client.shutdown()`.
