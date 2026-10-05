# Courier on Solid

The Courier inbox from the React example, rebuilt with `@priemskiyyy/prism-solid`. It runs on the same simulated flag backend and the same eight flags, so switching workspace or user changes the channels, the composer, the layout, the upload and contact limits and the maintenance notice exactly as it does in React.

```sh
pnpm build
pnpm --filter example-solid dev
```

`src/types/Register.d.ts` registers the Courier Prism once, and `Application.tsx` wraps the page in `<PrismProvider flags={props.runtime.flags}>`. From there every component reads flags by key and gets an accessor with the type its schema declared:

```tsx
const modern = useFlag("composer");
const split = useFlag("layout", (layout) => layout === "split");
```

The flag markers use `useFlagDetails(() => props.flagKey)` for the resolution dot, and the header's badge uses `usePrismStatus()`. No component receives the Prism as a prop. Keyed `<Show>` blocks stand in for React's `key`: a new workspace gets a fresh `WorkspaceView`, and a new conversation a fresh draft.

`main.tsx` owns the runtime. It creates the Prism, renders the application, mounts the devtools panel, starts the runtime and disposes all three when the page goes away or Vite replaces the module. The domain data, the inbox selection and the Tailwind recipes come from `examples/shared`. Run `pnpm --filter example-solid lint:typescript` and `pnpm vitest run --project example-solid` to check it.
