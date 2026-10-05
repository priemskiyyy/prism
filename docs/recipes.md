---
description: "Feature flag recipes with Prism: kill switches, remote configuration, gradual rollouts, per-workspace entitlements, gating routes, reading flags outside components, waiting for flags and analytics."
---

# Recipes

Short answers to common tasks. Each one uses only the public API.

## A kill switch

A flag whose fallback keeps the product working, so an outage of the flag service never takes the feature down with it:

```ts
const payments = flag(z.boolean(), { fallback: true, key: "payments-enabled" });
```

```tsx
const enabled = useFlag("payments");

return enabled ? <Checkout /> : <PaymentsPaused />;
```

Turning the flag off in the provider pauses checkout on the next read, which is instant with a streaming SDK or [live updates](updates.md).

## A maintenance banner

A nullable object carries the message along with the switch:

```ts
const maintenance = flag(
  z
    .object({
      message: z.string().min(1),
      severity: z.enum(["info", "warning"]),
    })
    .nullable(),
  { fallback: null },
);
```

```tsx
const notice = useFlag("maintenance");

return notice === null ? null : (
  <Banner tone={notice.severity}>{notice.message}</Banner>
);
```

## Remote configuration

A flag can hold any JSON your schema accepts, which makes it a typed remote config value:

```ts
const limits = flag(
  z.object({
    maxFiles: z.number().int().min(1).max(50),
    maxMegabytes: z.number().positive().max(500),
    allowedTypes: z.array(z.string()).min(1),
  }),
  {
    fallback: {
      maxFiles: 3,
      maxMegabytes: 10,
      allowedTypes: ["image/png", "image/jpeg"],
    },
  },
);
```

The schema's bounds protect you from a typo in the dashboard: a `maxFiles` of 5000 fails validation and the fallback stays.

## Entitlements per workspace

Put the workspace and its plan in the context and let the provider target on them. Switching workspace switches every limit in one read:

```ts
await flags.context({
  userId,
  workspaceId,
  plan: workspace.plan,
  role: membership.role,
});
```

The Courier [examples](examples.md) are built this way: channels, limits and the assistant all follow the workspace.

## Gating a route

Handles work outside components, so a router guard can read a flag directly:

```ts
router.beforeEach(async (to) => {
  if (to.meta.flag === undefined) {
    return true;
  }

  if (flags.status.get().state === "loading") {
    await flags.refresh();
  }

  return flags.flag(to.meta.flag).get() ? true : "/";
});
```

## Waiting for flags before rendering

Most pages should render with fallbacks and update. For the few that must not, await the read:

```ts
await flags.start({ context });
renderApplication();
```

Or wait inside the tree, by showing a skeleton while the resolution is `pending`; see [Flag details](details.md#loading-states).

## Different values in development

Point development at another adapter, or at the same adapter with another environment. Everything else stays the same:

```ts
const adapter = import.meta.env.DEV
  ? memory({ values: () => developmentValues })
  : http({ request: api.evaluateFlags });
```

For a single flag during a session, use the [devtools](devtools.md) or an [override](overrides.md).

## Reacting to a flag outside the UI

```ts
flags.flag("realtime").subscribe((enabled) => {
  if (enabled) {
    realtime.connect();

    return;
  }

  realtime.disconnect();
});
```

Subscriptions do not replay, so read `get()` once for the current state when you set this up.

## Logging variants with analytics

Attach the variants a user is in to every analytics event:

```ts
analytics.addContext(() => ({
  checkout: flags.flag("checkout").details.get().variant,
  onboarding: flags.flag("onboarding").details.get().variant,
}));
```

See [Tracking exposures](details.md#tracking-exposures) for recording the moment a user sees a variation.

## Retiring a flag

1. Make the fallback the value everyone gets.
2. Remove the flag from the provider; it now resolves `missing` and serves the fallback.
3. Remove the declaration. TypeScript points at every place that still reads it.
