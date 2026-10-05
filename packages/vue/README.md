# @priemskiyyy/prism-vue

Vue composables for Prism.

Register your Prism once, put it in a provider and read flags by key:

```ts
import { flags } from "src/flags/flags";

declare module "@priemskiyyy/prism-vue" {
  interface Register {
    prism: typeof flags;
  }
}
```

```vue
<script setup lang="ts">
import { PrismProvider } from "@priemskiyyy/prism-vue";
import { flags } from "src/flags/flags";
</script>

<template>
  <PrismProvider :flags="flags">
    <Composer />
  </PrismProvider>
</template>
```

```ts
const modern = useFlag("composer");
const details = useFlagDetails(() => props.flagKey);
const status = usePrismStatus();
```

Each composable returns a `ComputedRef`. Keys autocomplete and keep their schema's type; a ref or a getter works as well as a literal. `usePrism()` returns a computed ref of the provided instance for `context()` and `refresh()`. Reading by key without a provider throws a `PrismError` with the `INVALID_CONFIGURATION` code.

Handles work without a provider or a registration:

```ts
const enabled = useFlag(flags.flag("composer"));
const status = usePrismStatus(flags);
```

Derive selections with `computed`. Call composables during component setup. The provider never starts or disposes the Prism; the host owns `start()` and `dispose()`.
