---
description: "Type safety in Prism: values inferred from schemas, contexts inferred from adapters, the Register interface for key-based hooks in React, Vue, Solid and Svelte, and typing components that take a flag key."
---

# TypeScript

You write types in one place, the schemas, and Prism carries them everywhere else:

- a flag's value type is its schema's output,
- the context type comes from the adapter,
- a key that is not declared is a compile error,
- a value of the wrong type cannot be a fallback or an override.

```ts
const flags = new Prism({
  flags: {
    layout: flag(z.enum(["classic", "split"]), { fallback: "classic" }),
  },
  adapter: memory<{ userId: string }>({ values: () => ({}) }),
});

flags.flag("layout").get(); // "classic" | "split"
flags.flag("theme"); // error: "theme" is not a declared key
flags.start({ context: { user: "a" } }); // error: the adapter expects { userId }
flags.flag("layout").override("grid"); // error: not "classic" or "split"
```

The declarations work with `strict`, `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`, and need TypeScript 5.4 or newer.

## Registering your Prism

Handles carry their own types, so `useFlag(flags.flag("layout"))` is typed without any setup. Reading by key, as in `useFlag("layout")`, needs one more step: the binding has to know which Prism the provider carries. You tell it once, by augmenting its `Register` interface:

::: code-group

```ts [React]
declare module "@priemskiyyy/prism-react" {
  interface Register {
    prism: typeof flags;
  }
}
```

```ts [Vue]
declare module "@priemskiyyy/prism-vue" {
  interface Register {
    prism: typeof flags;
  }
}
```

```ts [Solid]
declare module "@priemskiyyy/prism-solid" {
  interface Register {
    prism: typeof flags;
  }
}
```

```ts [Svelte]
declare module "@priemskiyyy/prism-svelte" {
  interface Register {
    prism: typeof flags;
  }
}
```

:::

Put the block next to the runtime, or in a `.d.ts` file included by your `tsconfig.json`. If the runtime is created per request or in a factory, register its type instead of an instance:

```ts
import type { Prism } from "@priemskiyyy/prism";

declare module "@priemskiyyy/prism-react" {
  interface Register {
    prism: Prism<typeof definitions, AppContext>;
  }
}
```

Declaration merging needs an `interface`, so a lint rule that prefers `type` needs an exception on that line.

Without a registration, key-based hooks accept any string and return `JsonValue`. Handles stay precise either way.

## Registered types

Each binding exports the types derived from your registration:

| Type                 | Meaning                                     |
| -------------------- | ------------------------------------------- |
| `RegisteredPrism`    | `Prism<RegisteredFlags, RegisteredContext>` |
| `RegisteredFlags`    | Your flag definitions                       |
| `RegisteredContext`  | Your context type                           |
| `RegisteredKey`      | The union of declared keys                  |
| `RegisteredValue<K>` | The value type of the flag `K`              |

They make components that take a flag key as a prop type-safe:

```tsx
import { useFlagDetails } from "@priemskiyyy/prism-react";
import type { RegisteredKey } from "@priemskiyyy/prism-react";

type FlagBadgeProps = { flagKey: RegisteredKey };

export const FlagBadge = ({ flagKey }: FlagBadgeProps) => {
  const { resolution } = useFlagDetails(flagKey);

  return <span title={`${flagKey} is ${resolution}`}>{flagKey}</span>;
};

<FlagBadge flagKey="layout" />; // fine
<FlagBadge flagKey="nope" />; // error
```

## Core type helpers

| Type                      | Meaning                                            |
| ------------------------- | -------------------------------------------------- |
| `FlagDefinitions`         | The shape of a definitions object, for `satisfies` |
| `FlagKey<Definitions>`    | The declared keys of a definitions object          |
| `InferFlag<Definition>`   | The value type of one definition                   |
| `FlagHandle<T>`           | A flag's handle                                    |
| `FlagDetails<T>`          | `{ value, resolution, variant?, error? }`          |
| `PrismStatus`             | `{ state, refreshing, error? }`                    |
| `JsonValue`, `JsonObject` | What flag values and contexts are made of          |
| `StandardSchema<T>`       | The schema contract `flag` accepts                 |

```ts
import type { FlagKey, InferFlag } from "@priemskiyyy/prism";

type Key = FlagKey<typeof definitions>;
type Layout = InferFlag<(typeof definitions)["layout"]>;
```

The [API reference](api.md) lists every exported type.
