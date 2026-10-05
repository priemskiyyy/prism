---
description: "Fix common Prism problems: flags that stay on their fallback, missing resolutions, validation errors after a deploy, untyped keys, provider errors outside a provider, PostHog context conflicts and slow reads."
---

# Troubleshooting

## Every flag stays on its fallback

Check the status first: `flags.status.get()`.

| Status                    | Cause and fix                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `idle`                    | `start` was never called. Call it where you know the context.                                                                                            |
| `loading` for a long time | The first read has not finished. Look for a slow provider or an identify that never settles; the read fails with `TIMEOUT` after `timeout` milliseconds. |
| `error`                   | The read failed. `status.error.code` and `status.error.cause` say why.                                                                                   |
| `ready`                   | The read worked. Look at each flag's resolution instead.                                                                                                 |

## A flag resolves as `missing`

The provider has no value for the key it was asked for. Usually:

- the flag does not exist in this provider environment yet,
- the provider names it differently; set `key` on the declaration to the provider's name, and check `handle.providerKey`,
- for Statsig, PostHog and Unleash, the resource names a gate, flag or toggle that does not exist,
- for OpenFeature, the provider answered with the reason `DEFAULT` or `DISABLED`, which Prism treats as no value so your fallback wins.

## A flag resolves as `error` after a deploy

The provider serves a value your new schema rejects. The message names the flag, the check and the path:

```text
uploads: Invalid input: expected number, received string at maxFiles
```

Change the value in the provider, or make the schema accept what it sends. Until then the flag serves its fallback, and the other flags are unaffected.

## `The fallback does not satisfy the flag schema`

`flag` runs the fallback through the schema when the module loads. The cause names the failing check. Transforms count: a schema whose output does not pass the schema again cannot have a fallback; see [Transforms and defaults](schemas.md#transforms-and-defaults).

## `Flag schemas must validate synchronously`

The schema has an asynchronous refinement, or comes from a library that always validates asynchronously, such as Yup. Use a synchronous schema.

## `Reading flags by key needs a PrismProvider above`

A key-based hook ran outside a provider. Wrap the tree in `PrismProvider`, or `setPrism` in Svelte. Tests need the provider too, or read with handles instead of keys.

## `useFlag("…")` accepts any string

The binding does not know your Prism. Add the [`Register` augmentation](typescript.md#registering-your-prism) for the binding you import from, and make sure the file is part of your TypeScript program.

## A context switch shows fallbacks for a moment

That is intended: a new context resets every flag, so a new user never sees the previous user's values. Render a skeleton while the resolution is `pending`, or keep the old values in your own state for the length of the switch. See [Context and identity](context.md#replacing-the-context).

## PostHog fails with `CONTEXT_CONFLICT`

The context maps to a `distinct_id` that PostHog has not identified. Call `posthog.identify` before `flags.context`. See [PostHog](adapters/posthog.md#one-identity-at-a-time).

## A Statsig, PostHog or Unleash read fails with `INVALID_CONFIGURATION`

A declared flag has no entry in `resources`. Every declared key needs one.

## `A context must be a plain JSON object`

The context is an array, `null`, a class instance, or contains `undefined`, `NaN` or a function somewhere. Build it from plain data.

## Reads happen more often than expected

Each context switch, `refresh()`, provider change event and `updates` call requests a read, and bursts collapse into one. If you still see many, look for a context that changes on every render, such as one that includes a timestamp, or an `updates` source that fires continuously.

## Values change references on every read

They do not, when the provider sends equal data: unchanged values and branches keep their references. If a component re-renders on every read, it probably builds a new object from the value on each render; select the part you need instead.
