import { Prism, flag } from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import type { ObservableValue } from "@priemskiyyy/prism";
import { createEffect, createMemo, createRoot, createSignal } from "solid-js";
import { afterEach, expect, test, vi } from "vitest";
import { z } from "zod";
import { useObservableValue } from "src/primitives/internal/useObservableValue";
import { useFlag } from "src/primitives/useFlag";
import { useFlagDetails } from "src/primitives/useFlagDetails";
import { usePrismStatus } from "src/primitives/usePrismStatus";

const disposals: (() => void)[] = [];

afterEach(() => {
  for (const dispose of disposals.splice(0)) {
    dispose();
  }
});

function mount<T>(observe: () => T) {
  return createRoot((dispose) => {
    disposals.push(dispose);

    return { value: observe(), dispose };
  });
}

function observable<T>(initial: T) {
  let value = initial;
  const listeners = new Set<(value: T) => void>();
  const removed: ((value: T) => void)[] = [];

  const store: ObservableValue<T> = {
    get: () => value,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
        removed.push(listener);
      };
    },
  };

  return {
    store,
    active: () => listeners.size,
    emit(next: T) {
      value = next;

      for (const listener of listeners) {
        listener(next);
      }
    },
    emitRemoved: () => removed.forEach((listener) => listener(value)),
  };
}

test("observes value, details, and status without owning the runtime lifecycle", async () => {
  const adapter = createMockAdapter({
    evaluate: () => ({ enabled: { value: true } }),
  });

  const flags = new Prism({
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
    adapter,
  });

  const mounted = mount(() => ({
    value: useFlag(flags.flag("enabled")),
    details: useFlagDetails(flags.flag("enabled")),
    status: usePrismStatus(flags),
  }));

  expect(mounted.value.value()).toBe(false);
  expect(mounted.value.status().state).toBe("idle");
  expect(adapter.controller.opens).toBe(0);
  await flags.start({ context: {} });
  expect(mounted.value.value()).toBe(true);
  expect(mounted.value.details().resolution).toBe("resolved");
  expect(mounted.value.status().state).toBe("ready");
  mounted.dispose();
  expect(adapter.controller.disposals).toBe(0);
  await flags.dispose();
  expect(adapter.controller.disposals).toBe(1);
});

test("follows reactive getters and ignores removed subscriptions", () => {
  const first = observable(1);
  const second = observable(2);
  const [source, setSource] = createSignal(first.store);
  const mounted = mount(() => useObservableValue(source));

  expect(first.active()).toBe(1);
  setSource(second.store);
  expect(mounted.value()).toBe(2);
  expect(first.active()).toBe(0);
  first.emitRemoved();
  expect(mounted.value()).toBe(2);
  second.emit(3);
  expect(mounted.value()).toBe(3);
  mounted.dispose();
  expect(second.active()).toBe(0);
});

test("supports public handle and runtime getters", () => {
  const flags = new Prism({
    flags: {
      first: flag(z.number(), { fallback: 1 }),
      second: flag(z.number(), { fallback: 2 }),
    },
    adapter: createMockAdapter(),
  });

  const [handle, setHandle] = createSignal(flags.flag("first"));

  const mounted = mount(() => ({
    value: useFlag(handle),
    details: useFlagDetails(handle),
    status: usePrismStatus(() => flags),
  }));

  setHandle(flags.flag("second"));
  expect(mounted.value.value()).toBe(2);
  expect(mounted.value.details().value).toBe(2);
  expect(mounted.value.status().state).toBe("idle");
});

test("closes a change between the initial read and subscription", () => {
  let value = 1;

  const store: ObservableValue<number> = {
    get: () => value,
    subscribe: () => {
      value = 2;

      return () => {};
    },
  };

  expect(mount(() => useObservableValue(() => store)).value()).toBe(2);
});

test("uses createMemo equality for derived selections", () => {
  const source = observable({ count: 1, noise: 0 });
  const changed = vi.fn();

  const mounted = mount(() => {
    const value = useObservableValue(() => source.store);

    const count = createMemo(() => ({ count: value().count }), undefined, {
      equals: (previous, next) => previous.count === next.count,
    });

    createEffect(() => changed(count()));

    return count;
  });

  const original = mounted.value();

  source.emit({ count: 1, noise: 2 });
  expect(mounted.value()).toBe(original);
  expect(changed).toHaveBeenCalledTimes(1);
  source.emit({ count: 3, noise: 2 });
  expect(mounted.value()).toEqual({ count: 3 });
  expect(changed).toHaveBeenCalledTimes(2);
});

test("requires a reactive owner so every subscription has cleanup", () => {
  expect(() => useObservableValue(() => observable(1).store)).toThrow(
    "reactive owner",
  );
});
