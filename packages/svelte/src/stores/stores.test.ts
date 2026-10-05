import { Prism, flag } from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import type {
  FlagDetails,
  FlagHandle,
  ObservableValue,
  PrismStatus,
} from "@priemskiyyy/prism";
import { derived, get } from "svelte/store";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { flagStore } from "src/stores/flagStore";
import { flagDetailsStore } from "src/stores/flagDetailsStore";
import { prismStatusStore } from "src/stores/prismStatusStore";

const observable = <T>(initial: T, onSubscribe?: () => void) => {
  let value = initial;
  const listeners = new Set<(value: T) => void>();

  const source: ObservableValue<T> = {
    get: () => value,
    subscribe(listener) {
      onSubscribe?.();
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };

  return {
    source,
    set(next: T) {
      value = next;

      for (const listener of listeners) {
        listener(next);
      }
    },
    listeners: () => listeners.size,
  };
};

const createHandle = <T>(value: ObservableValue<T>) => {
  const details = observable<FlagDetails<T>>({
    value: value.get(),
    resolution: "resolved",
  });

  const handle: FlagHandle<T> = {
    ...value,
    key: "test",
    providerKey: "test",
    details: details.source,
    override: () => () => {},
  };

  return { handle, details };
};

describe("Svelte flag stores", () => {
  test("is lazy, replays the current value synchronously and works with Svelte get and derived", () => {
    const value = observable(1);
    const { handle } = createHandle(value.source);
    const store = flagStore(handle);

    expect(value.listeners()).toBe(0);
    value.set(2);
    expect(get(store)).toBe(2);
    expect(get(derived(store, (next) => next * 2))).toBe(4);
    expect(value.listeners()).toBe(0);

    const values: number[] = [];
    const stop = store.subscribe((next) => values.push(next));

    expect(values).toEqual([2]);
    value.set(3);
    expect(values).toEqual([2, 3]);
    stop();
    value.set(4);
    expect(get(store)).toBe(4);
    expect(value.listeners()).toBe(0);
  });

  test("treats duplicate callbacks as independent registrations", () => {
    const value = observable(false);
    const { handle } = createHandle(value.source);
    const store = flagStore(handle);
    const listener = vi.fn();
    const first = store.subscribe(listener);
    const second = store.subscribe(listener);

    expect(value.listeners()).toBe(2);
    first();
    first();
    value.set(true);
    expect(listener.mock.calls).toEqual([[false], [false], [true]]);
    expect(value.listeners()).toBe(1);
    second();
    expect(value.listeners()).toBe(0);
  });

  test("closes changes between sampling and listener registration", () => {
    const value = observable(false, (): void => {
      value.set(true);
    });

    const { handle } = createHandle(value.source);
    const listener = vi.fn();
    const stop = flagStore(handle).subscribe(listener);

    expect(listener.mock.calls).toEqual([[true]]);
    stop();
  });

  test("suppresses an unrelated update behind a selected primitive", () => {
    const value = observable({ count: 1, noise: 0 });
    const { handle } = createHandle(value.source);
    const selected: number[] = [];

    const stop = flagStore(handle, (next) => next.count).subscribe((next) =>
      selected.push(next),
    );

    value.set({ count: 1, noise: 9 });
    expect(selected).toEqual([1]);
    value.set({ count: 2, noise: 9 });
    expect(selected).toEqual([1, 2]);
    stop();
  });

  test("reports Svelte invalidation for a changed value", () => {
    const value = observable({ count: 1, noise: 0 });
    const { handle } = createHandle(value.source);
    const invalidated = vi.fn();
    const listener = vi.fn();
    const stop = flagStore(handle).subscribe(listener, invalidated);

    value.set({ count: 2, noise: 1 });
    expect(invalidated).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
  });

  test("preserves Object.is semantics for selected signed zero", () => {
    const value = observable(false);
    const { handle } = createHandle(value.source);
    const values: number[] = [];

    const stop = flagStore(handle, (next) => (next ? 0 : -0)).subscribe(
      (next) => values.push(next),
    );

    value.set(true);
    expect(values).toHaveLength(2);
    expect(Object.is(values[0], -0)).toBe(true);
    expect(Object.is(values[1], 0)).toBe(true);
    stop();
  });

  test("does not notify while a selected primitive is unchanged", () => {
    const value = observable({ enabled: true, revision: 1 });
    const { handle } = createHandle(value.source);
    const listener = vi.fn();
    const stop = flagStore(handle, (next) => next.enabled).subscribe(listener);

    value.set({ enabled: true, revision: 2 });
    value.set({ enabled: true, revision: 3 });
    expect(listener.mock.calls).toEqual([[true]]);
    stop();
  });

  test("keeps details and runtime status independent of value notifications", () => {
    const value = observable(true);
    const { handle, details } = createHandle(value.source);
    const values = vi.fn();
    const variants = vi.fn();

    const status = observable<PrismStatus>({
      state: "idle",
      refreshing: false,
    });

    const states = vi.fn();

    const stops = [
      flagStore(handle).subscribe(values),
      flagDetailsStore(handle, (next) => next.variant).subscribe(variants),
      prismStatusStore(
        { status: status.source },
        (next) => next.state,
      ).subscribe(states),
    ];

    details.set({ ...details.source.get(), variant: "treatment" });
    status.set({ state: "ready", refreshing: false });
    expect(values.mock.calls).toEqual([[true]]);
    expect(variants.mock.calls).toEqual([[undefined], ["treatment"]]);
    expect(states.mock.calls).toEqual([["idle"], ["ready"]]);

    for (const stop of stops) {
      stop();
    }
  });

  test("releases a registration if the first subscriber callback throws", () => {
    const value = observable(true);
    const { handle } = createHandle(value.source);

    expect(() =>
      flagStore(handle).subscribe(() => {
        throw new Error("subscriber");
      }),
    ).toThrow("subscriber");
    expect(value.listeners()).toBe(0);
  });

  test("never runs selectors from retained callbacks after release, including during source cleanup", () => {
    const value = observable(true);
    const { handle } = createHandle(value.source);
    const retained: (() => void)[] = [];

    const source = {
      ...handle,
      subscribe(listener: (value: boolean) => void) {
        const notify = () => listener(true);

        retained.push(notify);

        return notify;
      },
    };

    const selector = vi.fn((next: boolean) => next);
    const stop = flagStore(source, selector).subscribe(() => {});
    const calls = selector.mock.calls.length;

    stop();

    for (const notify of retained) {
      notify();
    }

    expect(selector).toHaveBeenCalledTimes(calls);
  });

  test("releases a registration if the post-registration selector throws", () => {
    const value = observable(1, (): void => {
      value.set(2);
    });

    const { handle } = createHandle(value.source);

    const store = flagStore(handle, (next) => {
      if (next === 2) {
        throw new Error("selector");
      }

      return next;
    });

    expect(() => store.subscribe(() => {})).toThrow("selector");
    expect(value.listeners()).toBe(0);
  });

  test("leaves all runtime acquisition and disposal to the application host", async () => {
    const adapter = createMockAdapter({
      evaluate: () => ({ enabled: { value: true } }),
    });

    const flags = new Prism({
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
      adapter,
    });

    const values: boolean[] = [];

    const stop = flagStore(flags.flag("enabled")).subscribe((next) =>
      values.push(next),
    );

    expect(values).toEqual([false]);
    expect(adapter.controller.opens).toBe(0);
    await flags.start({ context: {} });
    expect(values).toEqual([false, true]);
    stop();
    expect(adapter.controller.disposals).toBe(0);
    expect(adapter.controller.observers).toBe(1);
    await flags.dispose();
    expect(adapter.controller.disposals).toBe(1);
    expect(adapter.controller.observers).toBe(0);
  });
});
