# Contributing

Use Node 22.18 or newer and the pinned pnpm version. Run `pnpm install --frozen-lockfile`, then `pnpm check`.

## Layout

- `packages/core`: the runtime, the adapter contract, `/mock` and `/testing`, published as `@priemskiyyy/prism`.
- `packages/react`, `packages/vue`, `packages/solid`, `packages/svelte`: bindings that wrap `ObservableValue` in each framework's external store. They hold no flag logic.
- `packages/adapters/*`: one package per provider, each self-contained.
- `packages/integrations/simulcast`: the realtime `updates` bridge.
- `examples/*`: one small application per binding plus a fixture server. They import the built packages.

## Code

Prefer descriptive names, early returns and `type` declarations. ESLint rejects `any`, type assertions, interfaces, enums, `switch`, the `void` operator, logical assignment, `readonly` in any form and wildcard exports. Keep comments to a minimum: name things so the code needs none, and comment only a workaround whose reason is not visible in the code.

Trust typed configuration. Validate data that crosses a boundary: remote values, contexts and SDK results. Copy and freeze what you accept.

## Tests

Core behavior tests live next to the file they cover. Every adapter runs `testFlagAdapter` from `@priemskiyyy/prism/testing` and adds provider-specific tests beside it. A test that cannot fail is not a test; assert the behavior the change protects.

A change that claims to be faster comes with numbers. `pnpm build && pnpm bench` runs `benchmarks/` against the built packages; run it before and after the change on the same machine.

Do not publish, change remote flags or commit credentials while testing.
