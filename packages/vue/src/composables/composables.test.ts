import { Prism, flag } from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import type { ObservableValue } from "@priemskiyyy/prism";
import {
  computed,
  createApp,
  createSSRApp,
  defineComponent,
  h,
  nextTick,
  shallowRef,
  watchEffect,
} from "vue";
import type { ComputedRef } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, expect, test, vi } from "vitest";
import { z } from "zod";
import { useObservableValue } from "src/composables/internal/useObservableValue";
import { useFlag } from "src/composables/useFlag";
import { useFlagDetails } from "src/composables/useFlagDetails";
import { usePrismStatus } from "src/composables/usePrismStatus";

const disposals: (() => void)[] = [];

afterEach(() => {
  for (const dispose of disposals.splice(0)) {
    dispose();
  }
});

function mount<T>(observe: () => T) {
  let result: { value: T } | undefined;

  const app = createApp(
    defineComponent(() => {
      result = { value: observe() };

      return () => h("div");
    }),
  );

  app.mount(document.createElement("div"));
  disposals.push(() => app.unmount());

  if (!result) {
    throw new Error("Component setup did not run.");
  }

  return { value: result.value, dispose: () => app.unmount() };
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

  expect(mounted.value.value.value).toBe(false);
  expect(mounted.value.status.value.state).toBe("idle");
  expect(adapter.controller.opens).toBe(0);
  await flags.start({ context: {} });
  expect(mounted.value.value.value).toBe(true);
  expect(mounted.value.details.value.resolution).toBe("resolved");
  expect(mounted.value.status.value.state).toBe("ready");
  mounted.dispose();
  expect(adapter.controller.disposals).toBe(0);
  await flags.dispose();
  expect(adapter.controller.disposals).toBe(1);
});

test("follows reactive refs and getters while ignoring removed subscriptions", () => {
  const first = observable(1);
  const second = observable(2);
  const source = shallowRef(first.store);
  const mounted = mount(() => useObservableValue(() => source.value));

  expect(first.active()).toBe(1);
  source.value = second.store;
  expect(mounted.value.value).toBe(2);
  expect(first.active()).toBe(0);
  first.emitRemoved();
  expect(mounted.value.value).toBe(2);
  second.emit(3);
  expect(mounted.value.value).toBe(3);
  mounted.dispose();
  expect(second.active()).toBe(0);
});

test("supports public handle refs and runtime getters", () => {
  const flags = new Prism({
    flags: {
      first: flag(z.number(), { fallback: 1 }),
      second: flag(z.number(), { fallback: 2 }),
    },
    adapter: createMockAdapter(),
  });

  const handle = shallowRef(flags.flag("first"));

  const mounted = mount(() => ({
    value: useFlag(handle),
    details: useFlagDetails(() => handle.value),
    status: usePrismStatus(() => flags),
  }));

  handle.value = flags.flag("second");
  expect(mounted.value.value.value).toBe(2);
  expect(mounted.value.details.value.value).toBe(2);
  expect(mounted.value.status.value.state).toBe("idle");
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

  expect(mount(() => useObservableValue(() => store)).value.value).toBe(2);
});

test("uses Vue computed stability for derived selections", async () => {
  const source = observable({ count: 1, noise: 0 });
  const changed = vi.fn();

  const mounted = mount(() => {
    const value = useObservableValue(() => source.store);
    const count = computed(() => value.value.count);

    watchEffect(() => changed(count.value));

    return count;
  });

  source.emit({ count: 1, noise: 2 });
  await nextTick();
  expect(changed).toHaveBeenCalledTimes(1);
  source.emit({ count: 3, noise: 2 });
  await nextTick();
  expect(mounted.value.value).toBe(3);
  expect(changed).toHaveBeenCalledTimes(2);
});

test("server rendering reads the current snapshot without subscribing", async () => {
  const source = observable(7);
  let value: ComputedRef<number> | undefined;

  const app = createSSRApp(
    defineComponent(() => {
      value = useObservableValue(() => source.store);

      return () => h("span", value?.value);
    }),
  );

  expect(await renderToString(app)).toBe("<span>7</span>");
  expect(source.active()).toBe(0);
});

test("requires component setup so every subscription has an owner", () => {
  expect(() => useObservableValue(() => observable(1).store)).toThrow(
    "component setup",
  );
});
