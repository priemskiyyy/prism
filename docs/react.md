---
description: "React hooks for Prism: PrismProvider, useFlag and useFlagDetails by key or handle, selectors, usePrismStatus, usePrism, Strict Mode and server rendering."
---

# React

```sh
pnpm add @priemskiyyy/prism @priemskiyyy/prism-react
```

Requires React 18.2 or newer, including React 19. The same package works in [React Native and Expo](react-native.md).

| Export           | Returns                                   | Needs the provider    |
| ---------------- | ----------------------------------------- | --------------------- |
| `PrismProvider`  | the tree below it                         |                       |
| `useFlag`        | a flag's value                            | for keys, not handles |
| `useFlagDetails` | `{ value, resolution, variant?, error? }` | for keys, not handles |
| `usePrismStatus` | `{ state, refreshing, error? }`           | without an argument   |
| `usePrism`       | the Prism                                 | yes                   |
| `Register`       | types for all of the above                |                       |

## Setup

```tsx
// src/flags.ts
import { Prism, flag } from "@priemskiyyy/prism";
import { z } from "zod";

export const flags = new Prism({
  flags: {
    composer: flag(z.boolean(), { fallback: false }),
    uploads: flag(z.object({ maxFiles: z.number() }), {
      fallback: { maxFiles: 1 },
    }),
  },
  adapter,
});

declare module "@priemskiyyy/prism-react" {
  interface Register {
    prism: typeof flags;
  }
}
```

```tsx
// src/main.tsx
import { PrismProvider } from "@priemskiyyy/prism-react";
import { flags } from "./flags";

flags.start({ context: await getSession() }).catch(reportError);

root.render(
  <PrismProvider flags={flags}>
    <App />
  </PrismProvider>,
);
```

The provider only puts the Prism in context. It does not start, stop or dispose it, and unmounting it releases nothing but subscriptions. Give it another Prism and every hook below follows the new one.

## useFlag

```tsx
const composer = useFlag("composer"); // boolean
const maxFiles = useFlag("uploads", (uploads) => uploads.maxFiles); // number
```

Returns the flag's current value and re-renders when it changes. With a selector, the component re-renders only when the selected value changes, compared with `Object.is`. Values keep their references while they are equal, so selecting an object branch is as cheap as selecting a number.

Pass a handle instead of a key to read a flag without the provider, or from a Prism that is not the registered one:

```tsx
const composer = useFlag(flags.flag("composer"));
```

## useFlagDetails

```tsx
const details = useFlagDetails("composer");
const resolution = useFlagDetails("composer", (details) => details.resolution);
```

Returns `{ value, resolution, variant?, error? }`. Use it for loading states, error hints and analytics. See [Flag details](details.md).

## usePrismStatus

```tsx
const status = usePrismStatus();
const refreshing = usePrismStatus((status) => status.refreshing);
const other = usePrismStatus(otherFlags);
```

Returns the runtime's status: `state`, `refreshing` and the last `error`. Without an argument it reads the provided Prism; with a Prism it reads that one.

## usePrism

```tsx
const flags = usePrism();

const switchWorkspace = (workspaceId: string) => {
  flags.context({ ...session, workspaceId }).catch(reportError);
};
```

Returns the provided Prism, for `context`, `refresh` and handles. It throws a `PrismError` with `INVALID_CONFIGURATION` outside a provider, as do key-based reads.

## Rendering behavior

- Hooks subscribe with `useSyncExternalStore` and the official selector shim, so reads are tear-free under concurrent rendering.
- A read publishes every flag before notifying, so one context switch is one render, not one per flag.
- Strict Mode's double effects neither open nor dispose anything. Only your code starts and disposes the runtime.
- On the server, hooks read the current snapshot without subscribing. See [Server rendering](server-rendering.md).

## Swapping runtimes

Replacing the Prism on the provider is how an application moves between providers or environments without remounting:

```tsx
const [runtime, setRuntime] = useState(() => createRuntime("production"));

const useStaging = () => {
  runtime.dispose().catch(reportError);
  setRuntime(createRuntime("staging"));
};

return (
  <PrismProvider flags={runtime}>
    <App />
  </PrismProvider>
);
```

Start the new runtime in an effect, and give both the same definitions so the registered types stay true.
