import { Prism, PrismError, flag } from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import { createComponent, createRoot, createSignal } from "solid-js";
import type { Accessor } from "solid-js";
import { expect, test } from "vitest";
import { z } from "zod";
import { PrismProvider } from "src/context/PrismProvider";
import { useFlag } from "src/primitives/useFlag";
import { useFlagDetails } from "src/primitives/useFlagDetails";
import { usePrism } from "src/primitives/usePrism";
import { usePrismStatus } from "src/primitives/usePrismStatus";
import type { RegisteredPrism } from "src/types/Register";

const createFlags = (limit: number) =>
  new Prism({
    flags: {
      enabled: flag(z.boolean(), { fallback: false }),
      limit: flag(z.number(), { fallback: 1 }),
    },
    adapter: createMockAdapter({
      evaluate: () => ({ enabled: { value: true }, limit: { value: limit } }),
    }),
  });

const observeProvided = (flags: Accessor<RegisteredPrism>) =>
  createRoot((dispose) => {
    let read = () => "";

    createComponent(PrismProvider, {
      get flags() {
        return flags();
      },
      get children() {
        const limit = useFlag("limit");
        const enabled = useFlag(() => "enabled");
        const details = useFlagDetails("limit");
        const status = usePrismStatus();

        read = () =>
          [
            JSON.stringify(limit()),
            JSON.stringify(enabled()),
            details().resolution,
            status().state,
          ].join(":");

        return null;
      },
    });

    return { read: () => read(), dispose };
  });

test("reads flags by key from the provided Prism", async () => {
  const flags = createFlags(8);
  const observed = observeProvided(() => flags);

  expect(observed.read()).toBe("1:false:pending:idle");
  await flags.start({ context: {} });
  expect(observed.read()).toBe("8:true:resolved:ready");
  observed.dispose();
  await flags.dispose();
});

test("a new Prism on the provider re-points every key", async () => {
  const first = createFlags(3);
  const second = createFlags(12);
  const [current, setCurrent] = createSignal<RegisteredPrism>(first);

  await Promise.all([
    first.start({ context: {} }),
    second.start({ context: {} }),
  ]);

  const observed = observeProvided(current);

  expect(observed.read()).toBe("3:true:resolved:ready");
  setCurrent(second);
  expect(observed.read()).toBe("12:true:resolved:ready");
  observed.dispose();
  await Promise.all([first.dispose(), second.dispose()]);
});

test("usePrism returns the provided instance", () => {
  const flags = createFlags(1);

  createRoot((dispose) => {
    createComponent(PrismProvider, {
      flags,
      get children() {
        expect(usePrism()()).toBe(flags);

        return null;
      },
    });
    dispose();
  });
});

test("reading by key without a provider is a configuration error", () => {
  createRoot((dispose) => {
    expect(() => useFlag("limit")).toThrow(PrismError);
    expect(() => usePrismStatus()).toThrow(
      "Reading flags by key needs a PrismProvider above.",
    );
    dispose();
  });
});
