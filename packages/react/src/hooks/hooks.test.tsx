import { StrictMode } from "react";
import { Prism, flag } from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import { act, cleanup, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { z } from "zod";
import type {
  FlagDetails,
  FlagHandle,
  ObservableValue,
  PrismStatus,
} from "@priemskiyyy/prism";
import { useFlag } from "src/hooks/useFlag";
import { useFlagDetails } from "src/hooks/useFlagDetails";
import { usePrismStatus } from "src/hooks/usePrismStatus";

afterEach(cleanup);

const store = <T,>(initial: T, onSubscribe?: () => void) => {
  let value = initial;
  let subscriptions = 0;
  const listeners = new Set<(value: T) => void>();

  const observable: ObservableValue<T> = {
    get: () => value,
    subscribe: (listener) => {
      subscriptions += 1;
      onSubscribe?.();
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };

  return {
    observable,
    set(next: T) {
      value = next;

      for (const listener of listeners) {
        listener(next);
      }
    },
    active: () => listeners.size,
    subscriptions: () => subscriptions,
  };
};

const flagStore = <T,>(initial: T) => {
  const value = store(initial);

  const details = store<FlagDetails<T>>({
    value: initial,
    resolution: "resolved",
  });

  const handle: FlagHandle<T> = {
    ...value.observable,
    key: "test",
    providerKey: "test",
    details: details.observable,
    override: () => () => {},
  };

  return { value, details, handle };
};

describe("flag hooks", () => {
  test("returns typed values and updates only consumers whose selection changes", () => {
    const flag = flagStore({ enabled: true, limit: 3 });
    let renders = 0;

    const { result } = renderHook(() => {
      renders += 1;

      return useFlag(flag.handle, (value) => value.enabled);
    });

    expect(result.current).toBe(true);

    const before = renders;

    act(() => flag.value.set({ enabled: true, limit: 9 }));
    expect(renders).toBe(before);
    act(() => flag.value.set({ enabled: false, limit: 9 }));
    expect(result.current).toBe(false);
    expect(renders).toBe(before + 1);
  });

  test("keeps a selected nested branch stable while an unrelated field changes", async () => {
    const values: Record<string, unknown> = {
      uploads: { limits: { maxFiles: 2 }, label: "a" },
    };

    const adapter = createMockAdapter({
      evaluate: () =>
        Object.fromEntries(
          Object.entries(values).map(([key, value]) => [key, { value }]),
        ),
    });

    const flags = new Prism({
      adapter,
      flags: {
        uploads: flag(
          z.object({
            limits: z.object({ maxFiles: z.number() }),
            label: z.string(),
          }),
          { fallback: { limits: { maxFiles: 1 }, label: "" } },
        ),
      },
    });

    await flags.start({ context: {} });

    const { result } = renderHook(() =>
      useFlag(flags.flag("uploads"), (value) => value.limits),
    );

    const selected = result.current;

    expect(selected).toEqual({ maxFiles: 2 });
    values.uploads = { limits: { maxFiles: 2 }, label: "b" };
    await act(async () => {
      await flags.refresh();
    });
    expect(result.current).toBe(selected);
    await flags.dispose();
  });

  test("recomputes a changed selector without a provider event or resubscription", () => {
    const flag = flagStore({ first: 1, second: 2 });

    const { result, rerender } = renderHook(
      ({ field }: { field: "first" | "second" }) =>
        useFlag(flag.handle, (value) => value[field]),
      { initialProps: { field: "first" } },
    );

    expect(result.current).toBe(1);

    const subscriptions = flag.value.subscriptions();

    rerender({ field: "second" });
    expect(result.current).toBe(2);
    expect(flag.value.subscriptions()).toBe(subscriptions);
    act(() => flag.value.set({ first: 3, second: 4 }));
    expect(result.current).toBe(4);
  });

  test("moves the subscription when the handle changes", () => {
    const first = flagStore(false);
    const second = flagStore(true);

    const { result, rerender, unmount } = renderHook(
      ({ handle }) => useFlag(handle),
      { initialProps: { handle: first.handle } },
    );

    rerender({ handle: second.handle });
    expect(result.current).toBe(true);
    expect(first.value.active()).toBe(0);
    expect(second.value.active()).toBe(1);
    act(() => first.value.set(true));
    expect(result.current).toBe(true);
    unmount();
    expect(second.value.active()).toBe(0);
  });

  test("closes the read-to-subscribe race", () => {
    const flag = flagStore(false);

    const racing = store(false, (): void => {
      racing.set(true);
    });

    const handle = { ...flag.handle, ...racing.observable };
    const { result } = renderHook(() => useFlag(handle));

    expect(result.current).toBe(true);
  });

  test("observes detail-only updates independently of values", () => {
    const flag = flagStore(true);
    let valueRenders = 0;

    const valueHook = renderHook(() => {
      valueRenders += 1;

      return useFlag(flag.handle);
    });

    const detailHook = renderHook(() =>
      useFlagDetails(flag.handle, (details) => details.variant),
    );

    const before = valueRenders;

    act(() =>
      flag.details.set({
        ...flag.details.observable.get(),
        variant: "treatment",
      }),
    );
    expect(detailHook.result.current).toBe("treatment");
    expect(valueHook.result.current).toBe(true);
    expect(valueRenders).toBe(before);
  });

  test("Strict Mode leaves one registration per consumer and releases only its own", () => {
    const flag = flagStore(true);
    const external = flag.handle.subscribe(() => {});

    const first = renderHook(() => useFlag(flag.handle), {
      wrapper: StrictMode,
    });

    const second = renderHook(() => useFlag(flag.handle), {
      wrapper: StrictMode,
    });

    expect(flag.value.active()).toBe(3);
    first.unmount();
    expect(flag.value.active()).toBe(2);
    act(() => flag.value.set(false));
    expect(second.result.current).toBe(false);
    second.unmount();
    expect(flag.value.active()).toBe(1);
    external();
    expect(flag.value.active()).toBe(0);
  });

  test("observes runtime status with selector equality", () => {
    const status = store<PrismStatus>({
      state: "idle",
      refreshing: false,
    });

    const runtime = { status: status.observable };

    const { result } = renderHook(() =>
      usePrismStatus(runtime, (snapshot) => snapshot.state),
    );

    expect(result.current).toBe("idle");
    act(() => status.set({ state: "ready", refreshing: false }));
    expect(result.current).toBe("ready");
  });
});

test("Strict Mode observation neither acquires nor disposes an application-owned source", async () => {
  const adapter = createMockAdapter({
    evaluate: () => ({ enabled: { value: true } }),
  });

  const flags = new Prism({
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
    adapter,
  });

  const passive = renderHook(() => useFlag(flags.flag("enabled")), {
    wrapper: StrictMode,
  });

  expect(passive.result.current).toBe(false);
  expect(adapter.controller.opens).toBe(0);
  expect(adapter.controller.reads).toHaveLength(0);
  await act(async () => {
    await flags.start({ context: {} });
  });
  expect(passive.result.current).toBe(true);

  const second = renderHook(() => useFlag(flags.flag("enabled")), {
    wrapper: StrictMode,
  });

  expect(adapter.controller.opens).toBe(1);
  expect(adapter.controller.reads).toHaveLength(1);
  expect(adapter.controller.observers).toBe(1);
  passive.unmount();
  second.unmount();
  expect(adapter.controller.disposals).toBe(0);
  expect(adapter.controller.observers).toBe(1);
  await flags.dispose();
  expect(adapter.controller.disposals).toBe(1);
  expect(adapter.controller.observers).toBe(0);
});

test("renders on the server with the current values", async () => {
  const adapter = createMockAdapter({
    evaluate: () => ({ enabled: { value: true } }),
  });

  const flags = new Prism({
    flags: { enabled: flag(z.boolean(), { fallback: false }) },
    adapter,
  });

  await flags.start({ context: {} });

  const Composer = () => {
    const enabled = useFlag(flags.flag("enabled"));
    const state = usePrismStatus(flags, (status) => status.state);

    return <span>{`${state}:${enabled ? "on" : "off"}`}</span>;
  };

  expect(renderToString(<Composer />)).toBe("<span>ready:on</span>");
  await flags.dispose();
});
