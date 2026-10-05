import { Prism, PrismError, flag } from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import { flushSync, mount, unmount } from "svelte";
import { expect, test } from "vitest";
import { z } from "zod";
import Probe from "src/context/Probe.fixture.svelte";
import Provider from "src/context/Provider.fixture.svelte";

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

test("stores read flags by key from the Prism set above", async () => {
  const flags = createFlags(8);
  const target = document.createElement("div");
  const component = mount(Provider, { target, props: { flags } });

  expect(target.textContent?.trim()).toBe("1:false:pending:idle");
  await flags.start({ context: {} });
  flushSync();
  expect(target.textContent?.trim()).toBe("8:true:resolved:ready");
  await unmount(component);
  await flags.dispose();
});

test("reading by key without a Prism above is a configuration error", () => {
  expect(() => mount(Probe, { target: document.createElement("div") })).toThrow(
    PrismError,
  );
});
