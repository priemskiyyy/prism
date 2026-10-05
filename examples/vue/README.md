# Courier on Vue

The Courier inbox from the React example, rebuilt with `@priemskiyyy/prism-vue`. It runs on the same simulated flag backend and the same eight flags, so switching workspace or user changes the channels, the composer, the layout, the upload and contact limits and the maintenance notice exactly as it does in React.

```sh
pnpm build
pnpm --filter example-vue dev
```

`src/types/Register.d.ts` registers the Courier Prism once, and `Application.vue` puts the runtime's instance in a provider. From there every component reads flags by key, with the type its schema declared:

```vue
<script setup lang="ts">
const modern = useFlag("composer");
const uploads = useFlag("uploads");
</script>

<template>
  <span>{{ modern ? "New composer" : "Classic composer" }}</span>
  <span>Up to {{ uploads.maxFiles }} files</span>
</template>
```

The flag markers use `useFlagDetails(() => props.flagKey)` for the resolution dot, and the header's badge uses `usePrismStatus()`. No component receives the Prism as a prop.

`main.ts` owns the runtime. It creates the Prism, mounts the application and the devtools panel, starts the runtime and disposes all three when the page goes away or Vite replaces the module. The domain data, the inbox selection and the Tailwind recipes come from `examples/shared`, so the markup here is the only Vue-specific part. Run `pnpm --filter example-vue lint:typescript` and `pnpm vitest run --project example-vue` to check it.
