---
description: "Vue composables for Prism: PrismProvider, useFlag and useFlagDetails by key, ref, getter or handle, usePrismStatus, usePrism and server rendering."
---

# Vue

```sh
pnpm add @priemskiyyy/prism @priemskiyyy/prism-vue
```

Requires Vue 3.5 or newer. Every composable returns a `ComputedRef` and must be called during component setup.

| Export           | Returns                           |
| ---------------- | --------------------------------- |
| `PrismProvider`  | a component that provides a Prism |
| `useFlag`        | `ComputedRef<T>`                  |
| `useFlagDetails` | `ComputedRef<FlagDetails<T>>`     |
| `usePrismStatus` | `ComputedRef<PrismStatus>`        |
| `usePrism`       | `ComputedRef<Prism>`              |
| `Register`       | types for all of the above        |

## Setup

```ts
// src/flags.ts
export const flags = new Prism({ flags: definitions, adapter });

declare module "@priemskiyyy/prism-vue" {
  interface Register {
    prism: typeof flags;
  }
}
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { PrismProvider } from "@priemskiyyy/prism-vue";
import { flags } from "./flags";
</script>

<template>
  <PrismProvider :flags="flags">
    <RouterView />
  </PrismProvider>
</template>
```

Start the runtime in `main.ts`, where you mount the application:

```ts
flags.start({ context: await getSession() }).catch(reportError);
createApp(App).mount("#app");
```

## Reading flags

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useFlag, useFlagDetails } from "@priemskiyyy/prism-vue";

const composer = useFlag("composer");
const uploads = useFlag("uploads");
const maxFiles = computed(() => uploads.value.maxFiles);
const details = useFlagDetails("composer");
const resolution = computed(() => details.value.resolution);
</script>

<template>
  <NewComposer v-if="composer" :max-files="maxFiles" />
  <ClassicComposer v-else />
</template>
```

A key can be a literal, a ref or a getter, so a component whose key is a prop stays reactive:

```ts
const props = defineProps<{ flagKey: RegisteredKey }>();
const details = useFlagDetails(() => props.flagKey);
```

Derive selections with `computed`. Values keep their references while they are equal, so a computed over one field re-runs its dependents only when that field changes.

Handles work without the provider: `useFlag(flags.flag("composer"))`, or `useFlag(() => props.handle)`.

## Status and the instance

```ts
const status = usePrismStatus();
const flags = usePrism();

const switchWorkspace = (workspaceId: string) => {
  flags.value.context({ ...session, workspaceId }).catch(reportError);
};
```

`usePrismStatus(flags)` reads a Prism you pass instead of the provided one. Reading by key outside a provider throws a `PrismError` with `INVALID_CONFIGURATION`.

## Behavior

Composables subscribe when the component mounts and unsubscribe when it unmounts. The provider, like the composables, never starts or disposes the runtime. During server rendering, composables read the current snapshot without subscribing.
