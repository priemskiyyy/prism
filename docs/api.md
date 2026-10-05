---
description: "The complete Prism API: every export of the core, the mock and testing entries, the React, Vue, Solid and Svelte bindings, all adapters, the Simulcast integration and the devtools."
---

# API reference

Every public export, by package. Guides with examples are linked from each section.

## `@priemskiyyy/prism`

### `flag(schema, options)`

```ts
function flag<T extends JsonValue>(
  schema: StandardSchema<T>,
  options: { fallback: T; key?: string },
): FlagDefinition<T>;
```

Declares a flag. Throws `INVALID_CONFIGURATION` when the fallback fails the schema or the schema validates asynchronously. [Declaring flags](flags.md), [Schemas](schemas.md).

### `new Prism(options)`

```ts
class Prism<S extends FlagDefinitions, C> {
  constructor(options: {
    flags: S;
    adapter: FlagAdapter<C>;
    updates?: (context: C, refresh: () => void) => Unsubscribe;
    timeout?: number;
  });

  status: ObservableValue<PrismStatus>;
  flag<K extends FlagKey<S>>(key: K): FlagHandle<InferFlag<S[K]>>;
  start(options: { context: C }): Promise<void>;
  context(next: C): Promise<void>;
  refresh(): Promise<void>;
  dispose(): Promise<void>;
}
```

Throws `INVALID_CONFIGURATION` for empty or colliding provider keys and a timeout outside 1 to 2 147 483 647 milliseconds. [The runtime](runtime.md).

### `PrismError`

```ts
class PrismError extends Error {
  constructor(options: {
    code: PrismErrorCode;
    message?: string;
    key?: string;
    cause?: unknown;
  });

  code: PrismErrorCode;
  key: string | undefined;
}
```

`PrismErrorCode` is `"INVALID_CONFIGURATION" | "INVALID_CONTEXT" | "NOT_STARTED" | "DISPOSED" | "TIMEOUT" | "NETWORK" | "AUTHENTICATION" | "FORBIDDEN" | "RATE_LIMITED" | "PROTOCOL" | "CONTEXT_CONFLICT" | "EVALUATION_FAILED" | "VALIDATION"`. [Errors and recovery](errors.md).

### `createFlagAdapter(adapter)`

```ts
function createFlagAdapter<C>(adapter: FlagAdapter<C>): FlagAdapter<C>;
```

Wraps an adapter so disposal is idempotent, `identify` and `read` throw `DISPOSED` afterwards, and `invalidate` is ignored once disposal starts. [Writing an adapter](writing-an-adapter.md).

### Types

| Type                                                      | Definition                                                                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `FlagDefinition<T>`                                       | `{ fallback: T; key?: string; validate: (value: unknown) => T }`                                              |
| `FlagDefinitions`                                         | `Record<string, FlagDefinition>`                                                                              |
| `FlagKey<S>`                                              | The string keys of a definitions object                                                                       |
| `InferFlag<D>`                                            | The value type of a definition                                                                                |
| `FlagOptions<T>`                                          | `{ fallback: T; key?: string }`                                                                               |
| `FlagHandle<T>`                                           | `ObservableValue<T> & { key; providerKey; details; override(value): Unsubscribe }`                            |
| `FlagDetails<T>`                                          | `{ value: T; resolution: Resolution; variant?: string; error?: PrismError }`                                  |
| `Resolution`                                              | `"pending" \| "resolved" \| "missing" \| "error" \| "override"`                                               |
| `PrismStatus`                                             | `{ state: "idle" \| "loading" \| "ready" \| "error" \| "disposed"; refreshing: boolean; error?: PrismError }` |
| `PrismOptions<S, C>`                                      | The constructor options                                                                                       |
| `ObservableValue<T>`                                      | `{ get(): T; subscribe(listener): Unsubscribe }`                                                              |
| `Unsubscribe`                                             | `() => void`                                                                                                  |
| `JsonValue`, `JsonObject`, `JsonPrimitive`                | JSON data                                                                                                     |
| `StandardSchema<T>`, `StandardResult<T>`, `StandardIssue` | The Standard Schema v1 contract                                                                               |
| `FlagAdapter<C>`                                          | `{ name: string; open(observer: AdapterObserver): FlagSession<C> }`                                           |
| `FlagSession<C>`                                          | `{ identify(context); read(request): Evaluations \| Promise<Evaluations>; dispose() }`                        |
| `AdapterObserver`                                         | `{ invalidate(): void }`                                                                                      |
| `ReadRequest<C>`                                          | `{ context: C; flags: DeclaredFlag[]; signal: AbortSignal }`                                                  |
| `DeclaredFlag`                                            | `{ key: string; fallback: JsonValue }`, with the provider key                                                 |
| `Evaluations`                                             | `Record<string, Evaluation>`                                                                                  |
| `Evaluation`                                              | `{ value: unknown; variant?: string } \| { error: unknown }`                                                  |

## `@priemskiyyy/prism/mock`

```ts
function createMockAdapter<C>(options?: {
  evaluate?: (request: ReadRequest<C>) => Evaluations;
  manualReads?: boolean;
  manualIdentifies?: boolean;
  onDispose?: () => void | Promise<void>;
}): FlagAdapter<C> & { controller: MockController<C> };
```

`MockController` exposes `reads`, `identifies`, `opens`, `disposals`, `observers` and `invalidate()`. Each `MockRead` and `MockIdentify` has `settled`, `resolve` and `reject`. [Testing](testing.md#loading-and-failure).

## `@priemskiyyy/prism/testing`

```ts
function testFlagAdapter<C>(options: {
  name: string;
  create: () => FlagAdapterFixture<C> | Promise<FlagAdapterFixture<C>>;
}): void;

type FlagAdapterFixture<C> = {
  adapter: FlagAdapter<C>;
  context: C;
  nextContext: C;
  flags: DeclaredFlag[];
  verify: (evaluations: Evaluations, context: C) => void;
  cleanup?: () => void | Promise<void>;
};
```

Registers the adapter conformance suite with Vitest. The entry also re-exports `createMockAdapter`. [Testing an adapter](testing.md#testing-an-adapter).

## `@priemskiyyy/prism-react`

| Export                                                                                           | Signature                                                |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `PrismProvider`                                                                                  | `({ flags: RegisteredPrism; children }) => JSX.Element`  |
| `useFlag`                                                                                        | `(key \| handle, selector?) => value \| selection`       |
| `useFlagDetails`                                                                                 | `(key \| handle, selector?) => FlagDetails \| selection` |
| `usePrismStatus`                                                                                 | `(runtime?, selector?) => PrismStatus \| selection`      |
| `usePrism`                                                                                       | `() => RegisteredPrism`                                  |
| `Register`                                                                                       | The interface to augment with `{ prism: typeof flags }`  |
| `RegisteredPrism`, `RegisteredFlags`, `RegisteredContext`, `RegisteredKey`, `RegisteredValue<K>` | Types derived from `Register`                            |
| `PrismProviderProps`                                                                             | The provider's props                                     |

[React](react.md).

## `@priemskiyyy/prism-vue`

| Export                              | Signature                                                         |
| ----------------------------------- | ----------------------------------------------------------------- |
| `PrismProvider`                     | A component with a required `flags` prop                          |
| `useFlag`                           | `(key \| handle \| ref \| getter) => ComputedRef<T>`              |
| `useFlagDetails`                    | `(key \| handle \| ref \| getter) => ComputedRef<FlagDetails<T>>` |
| `usePrismStatus`                    | `(runtime?) => ComputedRef<PrismStatus>`                          |
| `usePrism`                          | `() => ComputedRef<RegisteredPrism>`                              |
| `Register` and the registered types | As in React                                                       |

[Vue](vue.md).

## `@priemskiyyy/prism-solid`

| Export                              | Signature                                                 |
| ----------------------------------- | --------------------------------------------------------- |
| `PrismProvider`                     | `(props: { flags; children }) => JSX.Element`             |
| `useFlag`                           | `(key \| handle \| accessor) => Accessor<T>`              |
| `useFlagDetails`                    | `(key \| handle \| accessor) => Accessor<FlagDetails<T>>` |
| `usePrismStatus`                    | `(runtime?) => Accessor<PrismStatus>`                     |
| `usePrism`                          | `() => Accessor<RegisteredPrism>`                         |
| `Register` and the registered types | As in React                                               |

[Solid](solid.md).

## `@priemskiyyy/prism-svelte`

| Export                              | Signature                                                           |
| ----------------------------------- | ------------------------------------------------------------------- |
| `setPrism`                          | `(flags: () => RegisteredPrism) => void`                            |
| `getPrism`                          | `() => RegisteredPrism`                                             |
| `flagStore`                         | `(key \| handle, select?) => Readable<T \| Selection>`              |
| `flagDetailsStore`                  | `(key \| handle, select?) => Readable<FlagDetails<T> \| Selection>` |
| `prismStatusStore`                  | `(runtime?, select?) => Readable<PrismStatus \| Selection>`         |
| `Register` and the registered types | As in React                                                         |

[Svelte](svelte.md).

## Adapters

| Package                                        | Export            | Options                                                                                                           |
| ---------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `@priemskiyyy/prism-http`                      | `http<C>`         | `{ request: (request: HttpRequest<C>) => Evaluations \| Promise<Evaluations> }`                                   |
| `@priemskiyyy/prism-memory`                    | `memory<C>`       | `{ values: (context: C) => Record<string, JsonValue> }`                                                           |
| `@priemskiyyy/prism-openfeature`               | `openFeature<C>`  | `{ client: Client; context: (context: C) => EvaluationContext }`                                                  |
| `@priemskiyyy/prism-openfeature-web`           | `openFeature<C>`  | `{ client: Client; context: (context: C) => EvaluationContext }`                                                  |
| `@priemskiyyy/prism-launchdarkly-web`          | `launchdarkly<C>` | `{ client; context: (context: C) => LDContext; hash?: (context: C) => string \| Promise<string> }`                |
| `@priemskiyyy/prism-launchdarkly-react-native` | `launchdarkly<C>` | `{ client; context: (context: C) => LDContext }`                                                                  |
| `@priemskiyyy/prism-growthbook`                | `growthbook<C>`   | `{ client: GrowthBook; attributes: (context: C) => Attributes }`                                                  |
| `@priemskiyyy/prism-unleash`                   | `unleash<C>`      | `{ client: UnleashClient; context: (context: C) => IMutableContext; resources: Record<string, UnleashResource> }` |
| `@priemskiyyy/prism-statsig`                   | `statsig<C>`      | `{ client: StatsigClient; user: (context: C) => StatsigUser; resources: Record<string, StatsigResource> }`        |
| `@priemskiyyy/prism-posthog`                   | `posthog<C>`      | `{ client: PostHog; userId: (context: C) => string; resources: Record<string, PostHogResource> }`                 |
| `@priemskiyyy/prism-configcat`                 | `configcat<C>`    | `{ client: IConfigCatClient; user: (context: C) => IUser }`                                                       |

`HttpRequest<C>` is `{ context: C; keys: string[]; signal: AbortSignal }`. `UnleashResource` is `{ toggle: string; select: "enabled" | "variant" | "payload" }`. `PostHogResource` is `{ flag: string; select: "enabled" | "variant" | "payload" }`. `StatsigResource` is `{ type: "gate"; name: string }` or `{ type: "config" | "experiment" | "layer"; name: string; parameter: string }`. Each package also exports its options type, and the LaunchDarkly packages export `LaunchDarklyClient`, the part of the SDK client they use. [Choose a provider](adapters.md).

## `@priemskiyyy/prism-simulcast`

```ts
function simulcastUpdates<C, Publication, Subscription>(options: {
  client: { channel(name: string): RealtimeChannel<Publication, Subscription> };
  channel: (context: C) => string | null;
  decode: (publication: RealtimePublication<Publication>) => boolean;
}): (context: C, refresh: () => void) => Unsubscribe;
```

Returns an `updates` function. [Live updates](updates.md#simulcast).

## `@priemskiyyy/prism-devtools`

```ts
class PrismDevtools<S extends FlagDefinitions, C> {
  constructor(options: { flags: Prism<S, C>; definitions: S });
  mount(container: HTMLElement): void;
  unmount(): void;
}
```

`@priemskiyyy/prism-devtools/react` exports a `PrismDevtools` component with the same two props. [Devtools](devtools.md).
