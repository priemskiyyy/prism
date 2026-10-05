---
description: "Declare feature flags with flag(schema, { fallback, key }): value types from the schema, fallbacks that must pass it, provider keys, JSON-only values and reusable definition modules."
---

# Declaring flags

A flag is a schema and a fallback. You declare every flag your application reads in one object and give it to the runtime:

```ts
import { Prism, flag } from "@priemskiyyy/prism";
import { z } from "zod";

export const flags = new Prism({
  flags: {
    composer: flag(z.boolean(), { fallback: false }),
    layout: flag(z.enum(["classic", "split"]), { fallback: "classic" }),
    uploads: flag(
      z.object({
        maxFiles: z.number().int().min(1).max(20),
        maxMegabytes: z.number().positive(),
      }),
      { fallback: { maxFiles: 1, maxMegabytes: 5 } },
    ),
  },
  adapter,
});
```

| Option     | Meaning                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `fallback` | The value the flag holds before the first read, when the provider has none, and when the provider's value fails the schema. Required. |
| `key`      | The name the provider knows the flag by, when it differs from the property name. Optional.                                            |

`flag` returns a frozen `FlagDefinition`. It has no state and no connection to a runtime, so you can declare flags in a module of their own and import them wherever the runtime is created.

## The value type comes from the schema

You never write the flag's type yourself. The schema's output is the type, and everything that reads the flag infers it:

```ts
flags.flag("composer").get(); // boolean
flags.flag("layout").get(); // "classic" | "split"
flags.flag("uploads").get().maxFiles; // number
```

The fallback is typed from the schema too, and TypeScript rejects a fallback of the wrong shape. At runtime `flag` also runs the fallback through the schema, so a fallback that is the right type but breaks a rule, such as `maxFiles: 0` against `min(1)`, throws a `PrismError` with the `INVALID_CONFIGURATION` code when the module loads. A flag can never fall back to a value its own schema rejects.

## Fallbacks

A flag's value is never `undefined`. Pick the fallback that is safe when you know nothing about the user:

- a feature that is still rolling out falls back to off,
- a limit falls back to the most restrictive plan,
- a kill switch falls back to the state that keeps the product working.

The fallback is what every user sees while the first read is in flight, so it is also what a server-rendered page shows before the client has read. `details.resolution` tells you whether a value is the fallback or the provider's answer; see [Flag details](details.md).

A nullable schema makes "no value" explicit when that is what you mean:

```ts
maintenance: flag(z.object({ message: z.string() }).nullable(), {
  fallback: null,
}),
```

## Provider keys

The property name is the key your code uses. By default it is also the key sent to the provider. Set `key` when the provider names the flag differently:

```ts
composer: flag(z.boolean(), { fallback: false, key: "new-composer" }),
contactLimit: flag(z.number().int(), { fallback: 500, key: "contact-limit" }),
```

Your code reads `flags.flag("composer")`, and the adapter asks the provider for `new-composer`. Handles expose both as `handle.key` and `handle.providerKey`. Renaming a flag in the provider then touches one line, and your code can use names that read well in TypeScript.

Keys must be non-empty, and two flags cannot resolve to the same provider key. Both mistakes throw `INVALID_CONFIGURATION` when the runtime is constructed.

## Values are JSON

Flag values come from providers over the network, so they are JSON: strings, finite numbers, booleans, `null`, arrays and plain objects. A schema whose output is a `Date`, a `Map`, `undefined`, `NaN` or a class instance cannot be a flag. Values that pass the schema are copied and deeply frozen, so a component cannot change a snapshot another component is reading.

Copy a value before you modify it:

```ts
const limits = { ...flags.flag("uploads").get(), maxFiles: 10 };
```

When the provider sends the same value again, the runtime keeps the previous reference, and it keeps unchanged branches of objects and arrays too. `Object.is` is therefore enough to detect a change, which is what the framework bindings rely on.

## Reusable definitions

Declare flags in their own module and check the shape with `satisfies`, which keeps every flag's precise type:

```ts
// src/flags/definitions.ts
import { flag } from "@priemskiyyy/prism";
import type { FlagDefinitions } from "@priemskiyyy/prism";
import { z } from "zod";

export const definitions = {
  composer: flag(z.boolean(), { fallback: false }),
  theme: flag(z.enum(["light", "dark"]), { fallback: "light" }),
} satisfies FlagDefinitions;
```

A large application can group flags by area and spread the groups into one object. Keys still have to be unique across the whole object:

```ts
export const definitions = {
  ...inboxFlags,
  ...billingFlags,
  ...experimentFlags,
} satisfies FlagDefinitions;
```

The same object is what the [devtools](devtools.md) take as `definitions`.

## Deriving types

The core exports helpers for the rare case where you need a flag's type outside a component:

```ts
import type { FlagKey, InferFlag } from "@priemskiyyy/prism";

type Definitions = typeof definitions;
type Key = FlagKey<Definitions>; // "composer" | "theme"
type Theme = InferFlag<Definitions["theme"]>; // "light" | "dark"
```

With a schema library you can also infer from the schema itself, for example `z.infer<typeof Theme>`. [TypeScript](typescript.md) covers registration and typing components that take a flag key.
