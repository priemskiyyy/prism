# @priemskiyyy/prism-react

React and React Native hooks for Prism.

Register your Prism once, put it in a provider and read flags by key:

```tsx
import { PrismProvider, useFlag } from "@priemskiyyy/prism-react";
import { flags } from "src/flags/flags";

declare module "@priemskiyyy/prism-react" {
  interface Register {
    prism: typeof flags;
  }
}

export const Application = () => (
  <PrismProvider flags={flags}>
    <Composer />
  </PrismProvider>
);

const Composer = () => {
  const modern = useFlag("composer");
  const maxFiles = useFlag("uploads", (uploads) => uploads.maxFiles);

  return modern ? <RichEditor maxFiles={maxFiles} /> : <PlainEditor />;
};
```

Keys autocomplete, and every value keeps the type its schema declared. `useFlagDetails("composer")` adds the resolution, variant and error, `usePrismStatus()` reports the runtime's state, and `usePrism()` returns the instance for `context()` and `refresh()`. Reading by key without a provider throws a `PrismError` with the `INVALID_CONFIGURATION` code. Give the provider another Prism and every hook below it follows.

Handles work without a provider or a registration, because they carry their own types:

```tsx
const enabled = useFlag(flags.flag("composer"));
const state = usePrismStatus(flags, (status) => status.state);
```

The hooks use `useSyncExternalStore` with the official selector implementation, so a selector re-renders a component only when its selection changes. The provider never starts or disposes the Prism; the host owns `start()` and `dispose()`.
