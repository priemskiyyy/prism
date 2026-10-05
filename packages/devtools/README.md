# @priemskiyyy/prism-devtools

An inspector for a running Prism: every flag's value, resolution, variant and error, local overrides that pass the flag's own schema, and a timeline of status changes and flag updates. It renders into a shadow root, so it neither styles nor is styled by the host page, and it reads nothing but the public runtime API.

```tsx
import { PrismDevtools } from "@priemskiyyy/prism-devtools/react";
import { flagDefinitions, flags } from "src/flags/flags";

export function Application() {
  return (
    <>
      <Inbox />
      <PrismDevtools flags={flags} definitions={flagDefinitions} />
    </>
  );
}
```

Without React, mount it into any element:

```ts
import { PrismDevtools } from "@priemskiyyy/prism-devtools";

const devtools = new PrismDevtools({
  flags,
  definitions: flagDefinitions,
});

devtools.mount(document.body);
```

`definitions` is the object you passed as `flags` to `new Prism`. The launcher in the corner opens the panel and counts overridden flags. An override is validated by the flag's schema before it is installed, and `unmount()` releases the overrides the devtools made. The panel remembers whether it was open and which tab was active in `localStorage`. Render it in development builds; nothing in it is meant for production users.
