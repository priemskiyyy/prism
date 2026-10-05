import { Prism, PrismError, flag } from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import { createApp, createSSRApp, h, nextTick, shallowRef } from "vue";
import type { Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, test } from "vitest";
import { z } from "zod";
import { useFlag } from "src/composables/useFlag";
import { useFlagDetails } from "src/composables/useFlagDetails";
import { usePrism } from "src/composables/usePrism";
import { usePrismStatus } from "src/composables/usePrismStatus";
import { PrismProvider } from "src/context/PrismProvider";
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

const Probe = {
  setup() {
    const limit = useFlag("limit");
    const enabled = useFlag(() => "enabled");
    const details = useFlagDetails("limit");
    const status = usePrismStatus();

    return () =>
      h(
        "output",
        [
          JSON.stringify(limit.value),
          JSON.stringify(enabled.value),
          details.value.resolution,
          status.value.state,
        ].join(":"),
      );
  },
};

const provided = (flags: () => RegisteredPrism, child: Component) => ({
  render: () => h(PrismProvider, { flags: flags() }, () => h(child)),
});

const mount = (component: Component) => {
  const root = document.createElement("div");
  const app = createApp(component);

  app.mount(root);

  return { root, app };
};

test("reads flags by key from the provided Prism", async () => {
  const flags = createFlags(8);
  const { root, app } = mount(provided(() => flags, Probe));

  expect(root.textContent).toBe("1:false:pending:idle");
  await flags.start({ context: {} });
  await nextTick();
  expect(root.textContent).toBe("8:true:resolved:ready");
  app.unmount();
  await flags.dispose();
});

test("a new Prism on the provider re-points every key", async () => {
  const first = createFlags(3);
  const second = createFlags(12);
  const current = shallowRef(first);

  await Promise.all([
    first.start({ context: {} }),
    second.start({ context: {} }),
  ]);

  const { root, app } = mount(provided(() => current.value, Probe));

  expect(root.textContent).toBe("3:true:resolved:ready");
  current.value = second;
  await nextTick();
  expect(root.textContent).toBe("12:true:resolved:ready");
  app.unmount();
  await Promise.all([first.dispose(), second.dispose()]);
});

test("usePrism returns the provided instance", () => {
  const flags = createFlags(1);
  const seen: unknown[] = [];

  const Reader = {
    setup() {
      seen.push(usePrism().value);

      return () => h("span");
    },
  };

  const { app } = mount(provided(() => flags, Reader));

  expect(seen).toEqual([flags]);
  app.unmount();
});

test("reading by key without a provider is a configuration error", () => {
  const errors: unknown[] = [];
  const app = createApp(Probe);

  app.config.errorHandler = (error) => {
    errors.push(error);
  };

  app.mount(document.createElement("div"));
  expect(errors[0]).toBeInstanceOf(PrismError);
  app.unmount();
});

test("renders provided values on the server", async () => {
  const flags = createFlags(5);

  await flags.start({ context: {} });
  expect(
    await renderToString(createSSRApp(provided(() => flags, Probe))),
  ).toContain("<output>5:true:resolved:ready</output>");
  await flags.dispose();
});
