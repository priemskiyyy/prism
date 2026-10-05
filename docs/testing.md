---
description: "Testing with Prism: memory adapters and overrides for component tests, createMockAdapter for controlled reads and identifies, testing loading and error states, and the adapter conformance suite."
---

# Testing

Flags are data, so most tests only need to choose the values. Three tools cover everything from component tests to adapter authoring.

| Tool                | From                         | Use it for                                                     |
| ------------------- | ---------------------------- | -------------------------------------------------------------- |
| `memory`            | `@priemskiyyy/prism-memory`  | Components that need specific values                           |
| `handle.override`   | the core                     | One value for one test                                         |
| `createMockAdapter` | `@priemskiyyy/prism/mock`    | Controlling when reads and identifies settle, and failing them |
| `testFlagAdapter`   | `@priemskiyyy/prism/testing` | Checking that your own adapter follows the contract            |

## Components with fixed values

Create a runtime per test with the memory adapter and render under the provider:

```tsx
import { Prism } from "@priemskiyyy/prism";
import { memory } from "@priemskiyyy/prism-memory";
import { PrismProvider } from "@priemskiyyy/prism-react";
import { render, screen } from "@testing-library/react";
import { definitions } from "src/flags/definitions";

const renderWithFlags = async (values: Record<string, JsonValue>) => {
  const flags = new Prism({
    flags: definitions,
    adapter: memory({ values: () => values }),
  });

  await flags.start({ context: { userId: "test" } });
  render(
    <PrismProvider flags={flags}>
      <Composer />
    </PrismProvider>,
  );

  return flags;
};

test("shows the new composer when the flag is on", async () => {
  const flags = await renderWithFlags({ composer: true });

  expect(screen.getByText("New composer")).toBeTruthy();
  await flags.dispose();
});
```

Values still go through the schemas, so a test with a value the provider could never send fails the way production would.

## One value for one test

```ts
test("the classic composer hides the toolbar", async () => {
  const release = flags.flag("composer").override(false);

  render(<Composer />);
  expect(screen.queryByRole("toolbar")).toBeNull();
  release();
});
```

Overrides work before `start`, so a component test does not even need a read.

## Loading and failure

`createMockAdapter` hands you every read and identify to settle when you choose:

```ts
import { createMockAdapter } from "@priemskiyyy/prism/mock";

test("shows a skeleton until the flags are known", async () => {
  const adapter = createMockAdapter({ manualReads: true });
  const flags = new Prism({ flags: definitions, adapter });
  const started = flags.start({ context: { userId: "test" } });

  render(
    <PrismProvider flags={flags}>
      <Inbox />
    </PrismProvider>,
  );
  expect(screen.getByTestId("inbox-skeleton")).toBeTruthy();

  await vi.waitFor(() => expect(adapter.controller.reads).toHaveLength(1));
  adapter.controller.reads[0]?.resolve({ "inbox-layout": { value: "split" } });
  await started;

  expect(await screen.findByTestId("split-inbox")).toBeTruthy();
});
```

| Option             | Meaning                                                    |
| ------------------ | ---------------------------------------------------------- |
| `evaluate`         | `(request) => Evaluations`, what an automatic read returns |
| `manualReads`      | Keep reads open until you call `resolve` or `reject`       |
| `manualIdentifies` | Keep identifies open until you call `resolve` or `reject`  |
| `onDispose`        | Runs when the runtime releases the adapter                 |

`adapter.controller` records what happened: `reads` and `identifies` with their requests and `resolve`/`reject` functions, the `opens`, `disposals` and `observers` counts, and `invalidate()` to simulate a provider change event. Reject a read with a `PrismError` to test error states:

```ts
adapter.controller.reads[0]?.reject(new PrismError({ code: "NETWORK" }));
```

## Testing an adapter

`testFlagAdapter` runs the conformance suite in Vitest. Give it a fresh fixture per test:

```ts
import { testFlagAdapter } from "@priemskiyyy/prism/testing";

testFlagAdapter({
  name: "my-provider",
  create: () => {
    const client = createFakeClient();

    return {
      adapter: myProvider({ client, context: (context) => context }),
      context: { userId: "a" },
      nextContext: { userId: "b" },
      flags: [{ key: "enabled", fallback: false }],
      verify: (evaluations, context) => {
        expect(evaluations).toEqual({
          enabled: { value: context.userId === "a" },
        });
      },
      cleanup: () => client.close(),
    };
  },
});
```

It checks that the adapter identifies and reads both contexts, disposes once, and rejects `identify` and `read` afterwards. Test your provider's change events and identify failures beside it. [Writing an adapter](writing-an-adapter.md) describes the contract.
