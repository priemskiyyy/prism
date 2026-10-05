---
description: "How the Prism runtime works inside: its three owners, the lifecycle states, identify ordering, the single read path, atomic publication, context replacement and disposal."
---

# Architecture

Prism follows Silo's atomic snapshot publication and Simulcast's explicit resource ownership. Four owners make up the core:

| Owner        | Responsibility                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `Prism`      | Public commands, the lifecycle, the flag records and the runtime status                          |
| `Connection` | The started adapter session: the current context, its identity, one read at a time and `updates` |
| `FlagRecord` | One flag's validated value, its details and its override                                         |
| `ValueStore` | A snapshot with listeners, installed first and notified afterwards, and views of it              |

## Lifecycle

The runtime is in one of three states: idle, started with a connection, or disposed with its cleanup promise. Commands narrow that state once and hand the work to the connection, which always has a session and a context, so a read or a replacement never checks for them.

## Identity

Every new context is identified once before its first read. Identify calls are chained, so they never overlap, and a context that was replaced while its identify waited in the chain is skipped. A read waits for the identity of its context. A failed identify fails that read and is retried by the next one. Disposal waits for a pending identify before it releases the session, so an SDK is never left halfway through a switch.

## Reads

Every command funnels into one path. `start`, `context`, `refresh` and adapter invalidations request a read, and an invalidation is a refresh nobody awaits. One read runs at a time, and every caller waiting for it shares its promise. A request that arrives before the active read has called the adapter joins that read, because the read will still observe the change, so SDK events fired during `identify` cost no second read. A later request waits for the next read, which starts as soon as the current one settles and answers every caller that queued for it. Each `refresh` call therefore resolves once a read that started at or after the call has been applied, a point-in-time barrier over provider state. A call with an unchanged context joins the in-flight read instead.

A read captures the current context object and an `AbortController`. When it settles, the runtime checks that it is still the active read. Context replacement and disposal detach the active read and its waiters before aborting it, so a late result for an old context is dropped without a generation counter. A timer aborts a read that exceeds the configured timeout and fails it with `TIMEOUT` even if the adapter ignores the signal. The adapter's result becomes a `Map` inside the read, so a missing result fails the read and a flag named like an object built-in, such as `constructor`, stays missing.

## Publication

Accepting a read hands each flag the read's evaluations, and the flag picks out its own provider key. A flag that receives the value and variant it last received, compared with a snapshot so that in-place mutation still counts as a change, stops there: no copy, no schema, no notification. Any other value is copied, frozen and validated through the flag's schema, then the details of every flag and the runtime status are installed. A flag's value is a view of its details store, so a value listener runs only when the value itself changes. Only after everything is installed does the runtime call the notification thunks, so a listener always sees the whole batch. `shareJson` keeps the previous reference for equal values and equal nested branches, which makes selectors free and keeps `Object.is` sufficient in the framework bindings. A store notifies a listener only while its snapshot is still the one the notification was created for, so a reentrant update supersedes the older pass.

Listener errors are rethrown in a microtask so one consumer cannot starve another. The application's `updates` callback and the unsubscribe it returns are isolated the same way: a throwing callback is reported and the transition that called it still completes.

## Context

`context(next)` copies and freezes the context, checks structural equality with the current one and otherwise replaces it: every record resets to its fallback, overrides are cleared, the new context joins the identify chain, the next read is installed, pending callers resolve as superseded and the previous read is aborted. Listeners run only after records, status and the read are installed, and the `updates` subscription is rebound last.

## Adapters

An adapter is cold until `open`, which receives `{ invalidate }` and returns `{ identify, read, dispose }`. `identify` switches the provider to a context. `read` gets the frozen context, the declared provider keys with their fallbacks and an abort signal, and returns a map of evaluations. A key that is absent from the map is missing; `{ error }` marks a provider failure for that key, and the error carries the key.

`createFlagAdapter` adds the shared bookkeeping: `invalidate` is ignored once disposal starts, `identify` and `read` throw after disposal and `dispose` returns one promise. The core checks its own state on every callback as well.

## Disposal

`dispose()` marks the runtime disposed synchronously: status becomes `disposed`, pending callers reject, stores close and the active read is aborted. The returned promise then unsubscribes `updates`, waits for a pending identify and awaits the adapter's disposal. Handles keep their last snapshot.
