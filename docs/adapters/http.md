---
description: "Read feature flags from your own API with @priemskiyyy/prism-http: the request function, the Evaluations response shape, validating responses, errors and a complete server endpoint."
---

# Your own API

`@priemskiyyy/prism-http` reads flags from an endpoint you own. It is the adapter for flags computed by your backend, and for providers your backend talks to on the client's behalf.

```sh
pnpm add @priemskiyyy/prism @priemskiyyy/prism-http
```

```ts
import { http } from "@priemskiyyy/prism-http";

type AppContext = { userId: string; workspaceId: string };

const adapter = http<AppContext>({
  request: ({ context, keys, signal }) =>
    api.post("/flags/evaluate", { context, keys }, { signal }),
});
```

The adapter has one option, `request`, and it is a function rather than a URL. Your API client already owns the base URL, authentication, retries and error handling, so flags become one more call through it.

## The request

`request` receives:

| Field     | Type          | Meaning                                                                         |
| --------- | ------------- | ------------------------------------------------------------------------------- |
| `context` | `C`           | The current context, a frozen JSON object                                       |
| `keys`    | `string[]`    | The provider keys of every declared flag                                        |
| `signal`  | `AbortSignal` | Aborted when the context changes, the read times out or the runtime is disposed |

Pass `signal` to `fetch` or your client so abandoned requests are cancelled.

## The response

`request` returns `Evaluations`, a record keyed by provider key, or a promise of one:

```json
{
  "new-composer": { "value": true, "variant": "on" },
  "uploads": { "value": { "maxFiles": 10, "maxMegabytes": 25 } },
  "layout": { "error": "Rule evaluation failed" }
}
```

| Entry                 | Result                                                    |
| --------------------- | --------------------------------------------------------- |
| `{ value, variant? }` | The value, validated by the flag's schema                 |
| `{ error }`           | The flag keeps its fallback with the `error` resolution   |
| Key left out          | The flag keeps its fallback with the `missing` resolution |

Only return keys that were asked for; the runtime ignores the rest.

## Validating the response

The runtime validates each value with its flag's schema, so a wrong value can only break its own flag. Validate the shape of the envelope in your client, so a broken response fails the read instead:

```ts
import { PrismError } from "@priemskiyyy/prism";
import { z } from "zod";

const EvaluationsResponse = z.record(
  z.string(),
  z.object({ value: z.json(), variant: z.string().optional() }),
);

const adapter = http<AppContext>({
  request: async ({ context, keys, signal }) => {
    const response = await fetch("/api/flags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ context, keys }),
      signal,
    });

    if (!response.ok) {
      throw new PrismError({
        code: response.status >= 500 ? "NETWORK" : "PROTOCOL",
        message: `The flag API answered ${response.status}.`,
      });
    }

    return EvaluationsResponse.parse(await response.json());
  },
});
```

## Errors

Throw a `PrismError` to choose the code the runtime reports: `NETWORK`, `AUTHENTICATION`, `FORBIDDEN`, `RATE_LIMITED`, `PROTOCOL` or `TIMEOUT`. Anything else you throw becomes `EVALUATION_FAILED` with your error as `cause`. Either way the read fails, every flag keeps its value and the status moves to `error`.

## A server endpoint

The endpoint receives the context and the keys, evaluates, and returns the record. With any HTTP framework it looks like this:

```ts
import { z } from "zod";

const EvaluationRequest = z.object({
  context: z.object({ userId: z.string(), workspaceId: z.string() }),
  keys: z.array(z.string()).max(1000),
});

app.post("/api/flags", async (request, response) => {
  const { context, keys } = EvaluationRequest.parse(request.body);
  const user = await authorize(request, context);
  const evaluated = await evaluateFlags(user, context.workspaceId);

  response.json(
    Object.fromEntries(
      keys
        .filter((key) => Object.hasOwn(evaluated, key))
        .map((key) => [key, { value: evaluated[key] }]),
    ),
  );
});
```

Trust nothing in the context for authorization. The server knows who is signed in; the context says what the client is looking at. The fixture server in `examples/server` is a complete, tested version of this endpoint.

## Updates

Your API has no change events of its own. Pair the adapter with [`updates`](../updates.md): a server-sent event stream, a [Simulcast](../updates.md#simulcast) channel, a timer, or a refresh when the tab becomes visible.
