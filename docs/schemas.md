---
description: "Validate feature flags with Zod, Valibot, ArkType or Effect through Standard Schema: side-by-side declarations, error messages, transforms, defaults and what cannot be a flag schema."
---

# Schemas

Every flag has a schema, and the schema alone decides which provider values are valid. Prism accepts any [Standard Schema](https://standardschema.dev) that validates synchronously. The core inlines the standard's types and depends on no schema library, so you use the one your application already has.

## One flag, four libraries

::: code-group

```ts [Zod]
import { flag } from "@priemskiyyy/prism";
import { z } from "zod";

export const uploads = flag(
  z.object({
    maxFiles: z.number().int().min(1),
    maxMegabytes: z.number().positive(),
  }),
  { fallback: { maxFiles: 1, maxMegabytes: 5 } },
);
```

```ts [Valibot]
import { flag } from "@priemskiyyy/prism";
import * as v from "valibot";

export const uploads = flag(
  v.object({
    maxFiles: v.pipe(v.number(), v.integer(), v.minValue(1)),
    maxMegabytes: v.pipe(v.number(), v.minValue(0.1)),
  }),
  { fallback: { maxFiles: 1, maxMegabytes: 5 } },
);
```

```ts [ArkType]
import { flag } from "@priemskiyyy/prism";
import { type } from "arktype";

export const uploads = flag(
  type({ maxFiles: "number.integer >= 1", maxMegabytes: "number > 0" }),
  { fallback: { maxFiles: 1, maxMegabytes: 5 } },
);
```

```ts [Effect]
import { flag } from "@priemskiyyy/prism";
import { Schema } from "effect";

export const uploads = flag(
  Schema.standardSchemaV1(
    Schema.Struct({
      maxFiles: Schema.Int.pipe(Schema.greaterThanOrEqualTo(1)),
      maxMegabytes: Schema.Number.pipe(Schema.positive()),
    }),
  ),
  { fallback: { maxFiles: 1, maxMegabytes: 5 } },
);
```

:::

All four give the flag the type `{ maxFiles: number; maxMegabytes: number }`, and all four reject a payload such as `{ "maxFiles": "many" }`. Libraries can be mixed within one set of definitions.

| Library | Version                  | Notes                                                 |
| ------- | ------------------------ | ----------------------------------------------------- |
| Zod     | 3.24 or newer, and Zod 4 | `zod/mini` works as well                              |
| Valibot | 1.0 or newer             | Use `v.pipe` for refinements                          |
| ArkType | 2.0 or newer             | String definitions and morphs work                    |
| Effect  | 3.13 or newer            | Wrap each schema in `Schema.standardSchemaV1`         |
| Yup     | not supported            | Its Standard Schema validation is always asynchronous |

## When a value fails

A provider value that fails the schema never reaches a component. The flag keeps its fallback, its resolution becomes `error`, and `details.error` is a `PrismError` with the `VALIDATION` code and a message built from the first issue:

```ts
flags.flag("uploads").details.get();
// {
//   value: { maxFiles: 1, maxMegabytes: 5 },
//   resolution: "error",
//   error: PrismError {
//     code: "VALIDATION",
//     key: "uploads",
//     message: "uploads: Invalid input: expected number, received string at maxFiles",
//   },
// }
```

The message is the library's own wording, prefixed with the flag key and followed by the path:

| Library | Message for `{ "maxFiles": "many" }`                                     |
| ------- | ------------------------------------------------------------------------ |
| Zod     | `uploads: Invalid input: expected number, received string at maxFiles`   |
| Valibot | `uploads: Invalid type: Expected number but received "many" at maxFiles` |
| ArkType | `uploads: maxFiles must be a number (was a string) at maxFiles`          |
| Effect  | `uploads: Expected number, actual "many" at maxFiles`                    |

The original issue list is on `error.cause`. Other flags from the same read are not affected; one bad payload fails one flag.

## Transforms and defaults

The value a flag holds is the schema's output, so defaults, trims and normalizations apply to provider values:

```ts
const theme = flag(
  z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(["light", "dark"])),
  {
    fallback: "light",
  },
);

const limits = flag(z.object({ maxFiles: z.number().int().default(3) }), {
  fallback: { maxFiles: 3 },
});
```

The fallback goes through the schema as well, exactly like a provider value. That makes one rule important: **the schema's output must also pass the schema.** A normalization such as `toLowerCase` or a default passes its own output, so it works. A transform that changes the type does not: a schema that parses the string `"20"` into the number `20` rejects the number fallback `20`, and `flag` throws `INVALID_CONFIGURATION`. Declare such a flag with the type the provider sends and convert where you read it:

```ts
const maxFiles = flag(z.string().regex(/^\d+$/), { fallback: "3" });

const limit = Number.parseInt(useFlag("maxFiles"), 10);
```

## What cannot be a flag schema

- **Asynchronous validation.** An async refinement, or a library that always validates asynchronously such as Yup, throws `INVALID_CONFIGURATION` at declaration with the message "Flag schemas must validate synchronously." A read has to validate every flag in the same pass that publishes them.
- **Non-JSON output.** `Date`, `Map`, `Set`, `undefined`, `NaN`, `Infinity` and class instances cannot be flag values. Keep flags as JSON and derive richer values in your code.

## Without a library

A Standard Schema is a plain object, so a small application can write one by hand:

```ts
import { flag } from "@priemskiyyy/prism";
import type { StandardSchema } from "@priemskiyyy/prism";

const percentage: StandardSchema<number> = {
  "~standard": {
    version: 1,
    vendor: "app",
    validate: (value) =>
      typeof value === "number" && value >= 0 && value <= 100
        ? { value }
        : { issues: [{ message: "Expected a percentage" }] },
  },
};

export const rollout = flag(percentage, { fallback: 0 });
```

An issue can carry a `path` of keys, which becomes the "at …" part of the error message.
