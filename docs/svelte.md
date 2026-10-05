---
description: "Svelte stores for Prism: setPrism and getPrism context, flagStore and flagDetailsStore by key or handle with selectors, prismStatusStore, runes and keyed blocks."
---

# Svelte

```sh
pnpm add @priemskiyyy/prism @priemskiyyy/prism-svelte
```

Requires Svelte 5. The binding exposes readable stores, which work in runes mode and in legacy components.

| Export             | Returns                                 |
| ------------------ | --------------------------------------- |
| `setPrism`         | sets the Prism for child components     |
| `getPrism`         | the Prism set above                     |
| `flagStore`        | `Readable<T>`, or `Readable<Selection>` |
| `flagDetailsStore` | `Readable<FlagDetails<T>>`              |
| `prismStatusStore` | `Readable<PrismStatus>`                 |
| `Register`         | types for all of the above              |

## Setup

```ts
// src/flags.ts
export const flags = new Prism({ flags: definitions, adapter });

declare module "@priemskiyyy/prism-svelte" {
  interface Register {
    prism: typeof flags;
  }
}
```

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { setPrism } from "@priemskiyyy/prism-svelte";
  import { flags } from "./flags";

  setPrism(() => flags);
</script>

<Inbox />
```

`setPrism` uses Svelte's context, so call it while the component initializes, in the component that owns the runtime. It takes a getter: when the Prism comes from a prop, `setPrism(() => runtime.flags)` keeps following the prop.

## Reading flags

```svelte
<script lang="ts">
  import { flagStore, flagDetailsStore } from "@priemskiyyy/prism-svelte";

  const modern = flagStore("composer");
  const maxFiles = flagStore("uploads", (uploads) => uploads.maxFiles);
  const composer = flagDetailsStore("composer");
</script>

{#if $composer.resolution === "pending"}
  <ComposerSkeleton />
{:else if $modern}
  <NewComposer maxFiles={$maxFiles} />
{:else}
  <ClassicComposer />
{/if}
```

Create stores while the component initializes, at the top of the script. A selector makes the store notify only when the selection changes. Stores are lazy: nothing subscribes to the flag until a component reads the store, which `$store` syntax does for you, and the subscription ends when that component is destroyed.

Handles work without context and anywhere in your code: `flagStore(flags.flag("composer"))`.

## Keys from props

A store is bound to its key when it is created. For a key that comes from a prop, read the instance once and derive the store from a handle:

```svelte
<script lang="ts">
  import { flagDetailsStore, getPrism } from "@priemskiyyy/prism-svelte";
  import type { RegisteredKey } from "@priemskiyyy/prism-svelte";

  let { flagKey }: { flagKey: RegisteredKey } = $props();

  const flags = getPrism();
  const details = $derived(flagDetailsStore(flags.flag(flagKey)));
</script>

<span>{flagKey}: {$details.resolution}</span>
```

## Status and the instance

```svelte
<script lang="ts">
  import { getPrism, prismStatusStore } from "@priemskiyyy/prism-svelte";

  const status = prismStatusStore();
  const flags = getPrism();
</script>

{#if $status.state === "error"}
  <button onclick={() => flags.refresh()}>Retry</button>
{/if}
```

`prismStatusStore(otherFlags)` reads another Prism, and `prismStatusStore((status) => status.refreshing)` selects from the one set above. Reading by key without a Prism above throws a `PrismError` with `INVALID_CONFIGURATION`.

## Resetting state per context

A context switch resets flags, not component state. Wrap a subtree in `{#key}` when its state belongs to one workspace:

```svelte
{#key workspaceId}
  <WorkspaceView {workspaceId} />
{/key}
```
