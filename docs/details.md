---
description: "Flag details in Prism: the value, the resolution (pending, resolved, missing, error, override), the provider's variant and a per-flag error, with patterns for loading states and exposure tracking."
---

# Flag details

A flag's value tells you what to render. Its details tell you why:

```ts
flags.flag("composer").details.get();
// { value: true, resolution: "resolved", variant: "on" }
```

| Field        | Type                      | Meaning                                                          |
| ------------ | ------------------------- | ---------------------------------------------------------------- |
| `value`      | the flag's type           | The same value `get()` returns                                   |
| `resolution` | `Resolution`              | Where the value came from                                        |
| `variant`    | `string \| undefined`     | The provider's name for the variation it served, when it has one |
| `error`      | `PrismError \| undefined` | Why this flag holds its fallback, in the `error` resolution      |

## Resolutions

| Resolution | Value                | When                                                                        |
| ---------- | -------------------- | --------------------------------------------------------------------------- |
| `pending`  | the fallback         | Before the first read for the current context                               |
| `resolved` | the provider's value | The provider answered and the value passed the schema                       |
| `missing`  | the fallback         | The provider has no value for this key                                      |
| `error`    | the fallback         | The provider reported an error for this key, or its value failed the schema |
| `override` | the override         | A [local override](overrides.md) is installed                               |

A failed read does not change resolutions. When the whole read fails, every flag keeps its current value and details, and the runtime's status carries the error. Resolutions describe single flags; the [status](runtime.md#status) describes the runtime.

`missing` is worth watching. It usually means the flag is not created in the provider yet, or the provider key does not match. The devtools show it in grey.

## Variants

`variant` comes from the provider:

| Provider             | `variant`                                                |
| -------------------- | -------------------------------------------------------- |
| Your API             | Whatever your endpoint returns as `variant`              |
| OpenFeature          | The provider's `variant` from the evaluation details     |
| GrowthBook           | The experiment's variation key, when the user is in one  |
| Unleash              | The variant name, for `variant` and `payload` selections |
| Statsig              | The experiment group name, for experiments and layers    |
| PostHog              | The multivariate flag's variant                          |
| ConfigCat            | The variation id                                         |
| LaunchDarkly, memory | Not reported                                             |

Use it to label analytics events or to tell two variations with the same value apart. Do not branch rendering on it; branch on the typed value.

## Loading states

Most flags do not need a loading state, because the fallback is a valid value. Where a flash of the fallback matters, such as a layout that moves when a flag resolves, wait for the resolution:

```tsx
const resolution = useFlagDetails("layout", (details) => details.resolution);
const layout = useFlag("layout");

if (resolution === "pending") {
  return <InboxSkeleton />;
}

return layout === "split" ? <SplitInbox /> : <ClassicInbox />;
```

The selector re-renders the component only when the resolution changes, not on every value update.

## Errors on a flag

```ts
const { error } = flags.flag("uploads").details.get();

if (error !== undefined) {
  console.warn(error.code, error.key, error.message);
}
```

A flag in the `error` resolution has a `PrismError` whose `key` is the flag's key. `VALIDATION` means the provider's value failed the schema, and the message names the failed check. Any other code comes from the provider for that flag alone. See [Errors and recovery](errors.md).

## Tracking exposures

A read evaluates every declared flag, so whether it counts as an exposure depends on the SDK. The LaunchDarkly, Statsig, PostHog and Unleash adapters read without recording anything. GrowthBook, ConfigCat and OpenFeature evaluate through their normal path, so their tracking callbacks and hooks run on every read. Each adapter page says exactly what a read records. When your analytics need an exposure, record it where the user actually sees the variation:

```tsx
const details = useFlagDetails("checkout");

useEffect(() => {
  if (details.resolution !== "resolved") {
    return;
  }

  analytics.track("experiment_viewed", {
    flag: "checkout",
    variant: details.variant,
  });
}, [details.resolution, details.variant]);
```
