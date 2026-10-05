# @priemskiyyy/prism-svelte

Svelte stores for Prism.

Register your Prism once, set it on a parent component and read flags by key:

```ts
import { flags } from "src/flags/flags";

declare module "@priemskiyyy/prism-svelte" {
  interface Register {
    prism: typeof flags;
  }
}
```

```svelte
<!-- Application.svelte -->
<script lang="ts">
  import { setPrism } from "@priemskiyyy/prism-svelte";
  import { flags } from "src/flags/flags";

  setPrism(() => flags);
</script>

<Composer />
```

```svelte
<!-- Composer.svelte -->
<script lang="ts">
  import { flagStore } from "@priemskiyyy/prism-svelte";

  const modern = flagStore("composer");
  const maxFiles = flagStore("uploads", (uploads) => uploads.maxFiles);
</script>

{#if $modern}<RichEditor maxFiles={$maxFiles} />{/if}
```

Keys autocomplete and keep their schema's type. `flagDetailsStore("composer")` adds the resolution, variant and error, `prismStatusStore()` reports the runtime's state, and `getPrism()` returns the instance for `context()` and `refresh()`. Call them while a component initializes. `setPrism` takes a getter, so a store created with `$derived(flagStore("composer"))` follows a Prism that the parent replaces. Reading by key without a Prism above throws a `PrismError` with the `INVALID_CONFIGURATION` code.

Handles work without context or a registration:

```ts
const enabled = flagStore(flags.flag("composer"));
const status = prismStatusStore(flags);
```

Stores are lazy and accept an optional selector. Subscribing samples the current value synchronously. Nothing here starts or disposes the Prism; the host owns `start()` and `dispose()`.
