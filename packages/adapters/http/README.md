# @priemskiyyy/prism-http

Your own API client as a Prism adapter.

## Installation

The npm preview uses the `next` dist-tag.

```sh
pnpm add @priemskiyyy/prism@next @priemskiyyy/prism-http@next
```

```ts
import { http } from "@priemskiyyy/prism-http";

const adapter = http<{ targetingKey: string }>({
  request: async ({ context, keys, signal }) => {
    const snapshot = await api.evaluateFlags({ context, keys }, { signal });
    return Object.fromEntries(
      snapshot.flags.map((flag) => [flag.key, { value: flag.value }]),
    );
  },
});
```

`request` receives the frozen context, the provider keys to evaluate and an abort signal, and returns `Evaluations`: a record of `{ value, variant? }` or `{ error }` per key. Keys you leave out fall back to their declarations. Your client owns the transport, authentication, retries and response validation. A thrown `PrismError` keeps its code; any other error is reported as `EVALUATION_FAILED` with the original as `cause`.
