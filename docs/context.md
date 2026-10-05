---
description: "How Prism handles the evaluation context: plain JSON objects, replacing the context on sign-in or workspace switch, what resets, how identify calls are ordered and why stale responses never commit."
---

# Context and identity

The context is what your provider targets: the user, the organization, the plan, the device. Prism holds one context at a time and reads every flag for it.

```ts
await flags.start({
  context: { userId: "user-42", workspaceId: "acme", plan: "business" },
});

await flags.context({
  userId: "user-42",
  workspaceId: "globex",
  plan: "enterprise",
});
```

## A context is a JSON object

The context type comes from the adapter. `http<AppContext>(...)`, `memory<AppContext>(...)` and the `context` mapper of an SDK adapter all fix it, so `start` and `context` accept exactly that shape:

```ts
type AppContext = { userId: string; workspaceId: string; plan: Plan };

const adapter = launchdarkly<AppContext>({
  client,
  context: ({ userId, workspaceId, plan }) => ({
    kind: "multi",
    user: { key: userId },
    organization: { key: workspaceId, plan },
  }),
});
```

At runtime the context must be a plain JSON object. Prism copies and freezes it, so mutating the object you passed changes nothing. A value that is not a JSON object, such as an array, a `Date` or an object with a `NaN`, is rejected with `INVALID_CONTEXT`.

Keep the context to what targeting needs. Every field is part of equality, so a timestamp or a random id in the context turns every call into a context switch.

## Replacing the context

`context(next)` replaces the whole context. There is no partial update; pass the full object:

```ts
const signIn = (user: User) =>
  flags.context({
    userId: user.id,
    workspaceId: user.workspaceId,
    plan: user.plan,
  });
```

When the new context equals the current one, compared as JSON with the same keys in the same order, nothing resets: the call joins the read in flight, or resolves at once when the flags are already current. When it differs, in this order:

1. Every flag goes back to its fallback with the resolution `pending`.
2. Every [local override](overrides.md) is cleared.
3. The new context is identified with the provider.
4. A read for it starts, and any read for the previous context is aborted.
5. Listeners are notified once, with all flags reset, and again when the read lands.
6. The `updates` subscription is rebound to the new context.

Resetting first is deliberate. A component never shows the previous user's value under the new user's name, and a new workspace never inherits the old workspace's limits for the length of a request. If the old value is safer to keep for your product, read the flags you need before the switch and hold them in your own state.

Calls that were waiting for the replaced context resolve, because their context is gone rather than failed.

## Identify ordering

Some SDKs keep a current identity: LaunchDarkly, Statsig, GrowthBook, ConfigCat and Unleash switch the SDK to a context before they can evaluate for it. Prism calls the adapter's `identify` once for every new context before its first read, and it orders those calls for you:

- Identify calls never overlap. A new one waits for the previous one to settle.
- A context that was replaced while its identify was waiting is skipped, so rapid switching ends with the SDK on the last context, not the first.
- A read waits for the identify of its own context.
- A failed identify fails its read. The next read, whether from `refresh` or a change event, retries it.
- `dispose` waits for a pending identify before it releases the adapter, so an SDK is never left halfway through a switch.

Adapters whose SDK takes the context on every evaluation, like the HTTP, memory and OpenFeature server adapters, identify instantly.

## Stale responses never commit

Each read remembers the context it was started for. If the context changes while a read is in flight, that read is detached and aborted, and its response is dropped even if the adapter ignores the abort signal. There is no window in which a slow response for the previous user overwrites the flags of the current one.

## Designing the context

| Situation                        | Context                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| Signed-out visitor               | `{ anonymousId }`, a stable id from a cookie or local storage         |
| Sign-in                          | `context({ userId, ... })`, which resets and reads for the user       |
| Workspace or organization switch | The same user with another `workspaceId`, plus what targets on it     |
| Plan change after checkout       | A new `plan` value, or `refresh()` when the provider derives the plan |
| Server rendering                 | One runtime per request, started with that request's context          |

Put only stable attributes in the context. A provider that needs the plan or the role gets them from the context; a provider that derives them from the user id gets only the id, and you `refresh()` when they change.
