---
description: "What Prism costs at runtime: reads that skip unchanged flags, values copied and validated once, shared references, one notification pass per read, memory per flag, bundle sizes, and pnpm bench to measure it yourself."
---

# Performance

Reading a flag is a property read: `get()` returns a snapshot the runtime already holds. The work happens when the provider answers, on `start`, `context`, `refresh` and every provider update. This page shows what that work costs and how to keep it small.

## What a read costs

Measured with `pnpm bench` on an Apple silicon laptop with Node 24. Times are per call.

| Work                                                 | Time   |
| ---------------------------------------------------- | ------ |
| 8 flags, nothing changed                             | 1 µs   |
| 100 boolean flags, nothing changed                   | 4 µs   |
| 1,000 boolean flags, nothing changed                 | 37 µs  |
| One 33 KB JSON config, nothing changed               | 53 µs  |
| 1,000 boolean flags, every value changed, 1 listener | 0.2 ms |
| One 33 KB JSON config, one rule edited               | 0.6 ms |
| Context switch with 100 boolean flags                | 19 µs  |

The benchmark adapter returns prepared results, so these numbers are the runtime alone. Your provider's SDK, the network and your components come on top.

## Unchanged values cost one comparison

Every flag keeps a snapshot of the last value and variant its provider sent. When a read brings the same JSON again, the flag compares it with that snapshot, without allocating, and stops: no copy, no schema, no notification. Most refreshes and provider events change nothing or change a few flags, so most of a read is that comparison.

A provider that mutates a value in place is still seen, because the snapshot is a copy. A new context reads every flag from scratch.

## Changed values are validated once

A changed value is copied through JSON, frozen and passed through the flag's schema. When the schema returns the value it was given, the runtime keeps that copy; when the schema transforms it, the runtime copies the output instead.

Before publishing, the runtime compares the new value with the one listeners saw last. Equal branches keep their old references. A component that selects `limits.maxFiles` does not re-render when another field of `limits` changes, and `Object.is` stays a correct equality check in every binding.

## One notification pass per read

A read installs every flag and the status first and calls listeners afterwards, so one read is one render pass however many flags changed. A listener hears only its own flag: a component that reads `composer` is not notified when `layout` changes. A selector narrows it further:

```tsx
const split = useFlag("layout", (layout) => layout === "split");
```

This component re-renders only when `split` flips.

## Memory

A started runtime holds about 1.1 KB per flag and about 250 bytes per subscription. Nothing grows with use: 100,000 context switches on one runtime, or 20,000 runtimes created, started and disposed, leave the heap where it started.

## Bundle size

Minified and gzipped, without peer dependencies:

| Package                       | Size                                             |
| ----------------------------- | ------------------------------------------------ |
| `@priemskiyyy/prism`          | 3.5 KB                                           |
| `@priemskiyyy/prism-react`    | 0.6 KB, or 1.5 KB with `use-sync-external-store` |
| `@priemskiyyy/prism-vue`      | 0.7 KB                                           |
| `@priemskiyyy/prism-solid`    | 0.6 KB                                           |
| `@priemskiyyy/prism-svelte`   | 0.6 KB                                           |
| An adapter                    | 0.2 to 0.8 KB, without its SDK                   |
| `@priemskiyyy/prism-devtools` | 5.9 KB                                           |

## Keeping it fast

- **Keep values small.** A large JSON config costs a tree comparison on every read, and a copy and a schema run whenever any part of it changes. Split a config whose parts change independently into several flags.
- **Let the provider push.** With [live updates](updates.md) the runtime reads when the provider changed something. A polling timer reads whether or not anything changed; that read is cheap, but it is still a call to your provider.
- **Load a heavy SDK when you need it.** The runtime serves fallbacks until the first read resolves, so the first render does not have to wait for a provider SDK. The React [example](examples.md) loads each SDK only when you select it.
- **Keep the devtools in development.** While its panel is closed it only counts overrides and records the timeline. It draws a tab when you open it.

## Measure it yourself

```sh
pnpm build
pnpm bench
```

The suite is `benchmarks/runtime.bench.ts` in the repository. Run it before and after a change on the same machine. The numbers above come from one laptop and will differ on yours.
