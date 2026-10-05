# @priemskiyyy/prism-memory

A deterministic Prism adapter for examples and tests.

```ts
import { z } from "zod";
import { Prism, flag } from "@priemskiyyy/prism";
import { memory } from "@priemskiyyy/prism-memory";

const flags = new Prism({
  flags: {
    enabled: flag(z.boolean(), { fallback: false }),
    label: flag(z.string(), { fallback: "" }),
  },
  adapter: memory({
    values: (context) => ({ enabled: true, label: context.user }),
  }),
});
await flags.start({ context: { user: "a" } });
```

`values` maps each context to a record of flag values and runs on every read, so change what it returns and call `flags.refresh()` to publish the change. Keys that are absent from the record fall back.
