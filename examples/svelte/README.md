# Courier on Svelte

The Courier inbox from the React example, rebuilt with `@priemskiyyy/prism-svelte`. It runs on the same simulated flag backend and the same eight flags, so switching workspace or user changes the channels, the composer, the layout, the upload and contact limits and the maintenance notice exactly as it does in React.

```sh
pnpm build
pnpm --filter example-svelte dev
```

`src/types/Register.d.ts` registers the Courier Prism once, and `Application.svelte` calls `setPrism(() => runtime.flags)`. From there every component creates stores by key while it initializes, and each store carries the type its schema declared:

```svelte
<script lang="ts">
  import { flagStore } from "@priemskiyyy/prism-svelte";

  const modern = flagStore("composer");
  const split = flagStore("layout", (layout) => layout === "split");
</script>

<span>{$modern ? "New composer" : "Classic composer"}</span>
```

A flag marker gets its key as a prop, so it reads the instance with `getPrism()` and derives its details store from a handle. The header's badge uses `prismStatusStore()`. No component receives the Prism as a prop. `{#key}` blocks stand in for React's `key`: a new workspace gets a fresh `WorkspaceView`, and a new conversation a fresh draft.

`main.ts` owns the runtime. It creates the Prism, mounts the application and the devtools panel, starts the runtime and disposes all three when the page goes away or Vite replaces the module. The domain data, the inbox selection and the Tailwind recipes come from `examples/shared`. Run `pnpm --filter example-svelte lint:typescript` and `pnpm vitest run --project example-svelte` to check it.
