# @priemskiyyy/prism-solid

Solid primitives for Prism.

## Installation

The npm preview uses the `next` dist-tag.

```sh
pnpm add @priemskiyyy/prism@next @priemskiyyy/prism-solid@next
```

Register your Prism once, put it in a provider and read flags by key:

```tsx
import { PrismProvider, useFlag } from "@priemskiyyy/prism-solid";
import { flags } from "src/flags/flags";

declare module "@priemskiyyy/prism-solid" {
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

  return (
    <Show when={modern()} fallback={<PlainEditor />}>
      <RichEditor />
    </Show>
  );
};
```

Each primitive returns an `Accessor`. Keys autocomplete and keep their schema's type; an accessor such as `() => props.flagKey` works as well as a literal. `useFlagDetails`, `usePrismStatus()` and `usePrism()` read the same provider. Reading by key without a provider throws a `PrismError` with the `INVALID_CONFIGURATION` code.

Handles work without a provider or a registration:

```tsx
const enabled = useFlag(flags.flag("composer"));
const status = usePrismStatus(() => flags);
```

Derive selections with `createMemo`. Call primitives under a reactive owner. The provider never starts or disposes the Prism; the host owns `start()` and `dispose()`.
