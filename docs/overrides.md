---
description: "Local flag overrides in Prism: handle.override(value) validated by the flag's schema, release functions, precedence, context resets and override recipes for QA, previews and tests."
---

# Local overrides

An override replaces a flag's value in this runtime only, without touching the provider:

```ts
const release = flags.flag("composer").override(true);

flags.flag("composer").get(); // true
flags.flag("composer").details.get().resolution; // "override"

release();

flags.flag("composer").get(); // the provider's value again
```

Overrides are how the [devtools](devtools.md) let you try a variation, and they are useful for QA links, design reviews and tests. They live in memory: nothing is persisted, nothing is sent, and other users and tabs are unaffected.

## Validated like provider values

An override passes through the flag's schema before it is installed. A value the schema rejects throws a `PrismError` with the `VALIDATION` code, and nothing changes:

```ts
flags.flag("uploads").override({ maxFiles: 0, maxMegabytes: 5 });
// PrismError: Too small: expected number to be >=1 at maxFiles
```

Transforms apply, so an override holds the same normalized shape a provider value would.

## Precedence and release

- The newest override wins. Overriding a flag that already has one replaces it.
- `override` returns a release function. Releasing the active override reveals the provider's value, or the fallback when the provider has none.
- Releasing an override that was already replaced does nothing, so two pieces of code that each hold a release function cannot remove each other's value.
- A [context switch](context.md) clears every override. An override made for one user never carries over to the next.
- Overrides work before `start`, which makes them useful in tests and stories. After `dispose`, `override` throws `DISPOSED`.

## Overrides from the URL

A QA link that turns a flag on for one session:

```ts
const overrides = new URLSearchParams(location.search).getAll("flag");

for (const entry of overrides) {
  const [key, raw] = entry.split("=");

  if (key === "composer") {
    flags.flag("composer").override(raw === "on");
  }
}
```

`?flag=composer=on` opens the page with the new composer. Keep such code out of production builds or behind an allow list; an override bypasses targeting.

## Overrides in tests

Overrides are often simpler than configuring the adapter:

```ts
test("the classic composer hides the toolbar", () => {
  const release = flags.flag("composer").override(false);

  render(<Composer />);
  expect(screen.queryByRole("toolbar")).toBeNull();
  release();
});
```

See [Testing](testing.md) for adapters that you drive by hand.
