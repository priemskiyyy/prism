---
description: "The Prism devtools: an in-page panel with every flag's value, resolution, variant and error, schema-checked overrides, a timeline, docking and resizing, for React or any framework."
---

# Devtools

`@priemskiyyy/prism-devtools` adds a panel to your page that shows what every flag holds and lets you override it.

```sh
pnpm add -D @priemskiyyy/prism-devtools
```

![The devtools panel open over the Courier example, listing every flag with its value and resolution](/images/screenshots/devtools.png)

## React

```tsx
import { PrismDevtools } from "@priemskiyyy/prism-devtools/react";
import { definitions, flags } from "./flags";

export const App = () => (
  <>
    <Inbox />
    {import.meta.env.DEV ? (
      <PrismDevtools flags={flags} definitions={definitions} />
    ) : null}
  </>
);
```

## Any framework

The panel itself has no framework dependency. Mount it into any element:

```ts
import { PrismDevtools } from "@priemskiyyy/prism-devtools";

const devtools = new PrismDevtools({ flags, definitions });

devtools.mount(document.body);
```

Call `devtools.unmount()` when the page or the runtime goes away. The Vue, Solid and Svelte examples mount it this way from their entry files.

`definitions` is the same object you passed as `flags` to `new Prism`. The panel reads the schemas from it to validate overrides and the fallbacks to show next to each value.

## What it shows

- **Flags.** Every flag with its value, resolution, variant, provider key and error, updating live. Type in the filter to narrow the list.
- **Overrides.** Set a value for any flag. The value passes the flag's schema before it is installed, exactly like `handle.override`, so the panel cannot put the page in a state a provider could not. Release one flag, or every override at once.
- **Timeline.** Status changes and flag updates as the runtime publishes them, newest first.
- **Refresh.** Read every flag again, the same as `flags.refresh()`.

The launcher in the corner shows the runtime's status, the number of declared flags and, when there are any, the number of overridden ones.

## Layout and preferences

Dock the panel at the bottom or on the right, and drag its free edge to resize it. The panel remembers whether it was open, which tab was active, where it was docked and how large it was, in `localStorage`.

It renders into a shadow root, so it neither inherits the page's styles nor leaks its own, and it reads nothing but the public runtime API. Updates are batched: while the panel is closed it only counts overrides and keeps the last 100 timeline events, and it draws the rows and events of a tab when you open it.

## In production

The panel is a development tool. Render it only in development builds, or behind an internal flag for staff, and remove it from bundles your customers load. `unmount()` releases every override the panel made.
