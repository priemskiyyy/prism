---
description: "Solid primitives for Prism: PrismProvider, useFlag and useFlagDetails by key, accessor or handle, usePrismStatus, usePrism and keyed resets."
---

# Solid

```sh
pnpm add @priemskiyyy/prism@next @priemskiyyy/prism-solid@next
```

Requires Solid 1.8 or newer. Every primitive returns an `Accessor` and must run under a reactive owner, such as a component.

| Export           | Returns                      |
| ---------------- | ---------------------------- |
| `PrismProvider`  | a context provider component |
| `useFlag`        | `Accessor<T>`                |
| `useFlagDetails` | `Accessor<FlagDetails<T>>`   |
| `usePrismStatus` | `Accessor<PrismStatus>`      |
| `usePrism`       | `Accessor<Prism>`            |
| `Register`       | types for all of the above   |

## Setup

```tsx
// src/flags.ts
export const flags = new Prism({ flags: definitions, adapter });

declare module "@priemskiyyy/prism-solid" {
  interface Register {
    prism: typeof flags;
  }
}
```

```tsx
// src/index.tsx
import { PrismProvider } from "@priemskiyyy/prism-solid";
import { render } from "solid-js/web";
import { flags } from "./flags";

flags.start({ context: await getSession() }).catch(reportError);

render(
  () => (
    <PrismProvider flags={flags}>
      <App />
    </PrismProvider>
  ),
  root,
);
```

## Reading flags

```tsx
import { Show, createMemo } from "solid-js";
import { useFlag } from "@priemskiyyy/prism-solid";

export const Composer = () => {
  const modern = useFlag("composer");
  const uploads = useFlag("uploads");
  const maxFiles = createMemo(() => uploads().maxFiles);

  return (
    <Show when={modern()} fallback={<ClassicComposer />}>
      <NewComposer maxFiles={maxFiles()} />
    </Show>
  );
};
```

A key can be a literal or an accessor, so a component whose key is a prop stays reactive:

```tsx
const FlagBadge = (props: { flagKey: RegisteredKey }) => {
  const details = useFlagDetails(() => props.flagKey);

  return <span>{details().resolution}</span>;
};
```

Derive selections with `createMemo`. Values keep their references while they are equal, so a memo over one field notifies only when that field changes. Handles work without the provider: `useFlag(flags.flag("composer"))`.

## Status and the instance

```tsx
const status = usePrismStatus();
const flags = usePrism();

const switchWorkspace = (workspaceId: string) => {
  flags()
    .context({ ...session, workspaceId })
    .catch(reportError);
};
```

`usePrismStatus(() => otherFlags)` reads another Prism. Reading by key outside a provider throws a `PrismError` with `INVALID_CONFIGURATION`.

## Resetting state per context

A context switch resets flags, not your components. When local state depends on the workspace, key the subtree on it, the way React uses `key`:

```tsx
<Show when={workspaceId()} keyed>
  {(id) => <WorkspaceView workspaceId={id} />}
</Show>
```

The Solid Courier example uses this pattern for the inbox filter and the draft reply.
