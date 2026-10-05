# @priemskiyyy/prism

Typed, reactive feature flags with validated snapshots and an explicit lifecycle.

```ts
import { z } from "zod";
import { Prism, flag } from "@priemskiyyy/prism";

const flags = new Prism({
  adapter,
  flags: {
    composer: flag(z.boolean(), { fallback: false }),
    uploadLimit: flag(z.number(), { fallback: 5 }),
  },
});
await flags.start({ context: { targetingKey: "user-1" } });
flags.flag("composer").get();
```

`flag(schema, { fallback, key? })` declares a flag with any synchronous Standard Schema; the schema's output is the flag's type. Handles expose `get`, `subscribe`, `details` and `override`. The runtime exposes `start`, `context`, `refresh`, `dispose` and `status`.

`@priemskiyyy/prism/mock` provides `createMockAdapter` for tests. `@priemskiyyy/prism/testing` provides `testFlagAdapter`, the conformance suite every adapter runs. See the [repository README](https://github.com/priemskiyyy/prism#readme).
