import { Prism, PrismError, flag } from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, test } from "vitest";
import { z } from "zod";
import { PrismProvider } from "src/context/PrismProvider";
import { useFlag } from "src/hooks/useFlag";
import { useFlagDetails } from "src/hooks/useFlagDetails";
import { usePrism } from "src/hooks/usePrism";
import { usePrismStatus } from "src/hooks/usePrismStatus";

afterEach(cleanup);

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

const Limit = () => <output>{JSON.stringify(useFlag("limit"))}</output>;

test("reads flags by key from the provided Prism", async () => {
  const flags = createFlags(8);

  const wrapper = ({ children }: PropsWithChildren) => (
    <PrismProvider flags={flags}>{children}</PrismProvider>
  );

  const { result } = renderHook(
    () => ({
      enabled: useFlag("enabled"),
      large: useFlag("limit", (value) => value === 8),
      resolution: useFlagDetails("limit", (details) => details.resolution),
      state: usePrismStatus((status) => status.state),
      flags: usePrism(),
    }),
    { wrapper },
  );

  expect(result.current).toMatchObject({
    enabled: false,
    large: false,
    resolution: "pending",
    state: "idle",
  });
  expect(result.current.flags).toBe(flags);
  await act(async () => {
    await flags.start({ context: {} });
  });
  expect(result.current).toMatchObject({
    enabled: true,
    large: true,
    resolution: "resolved",
    state: "ready",
  });
  await flags.dispose();
});

test("a new Prism on the provider re-points every key", async () => {
  const first = createFlags(3);
  const second = createFlags(12);

  await Promise.all([
    first.start({ context: {} }),
    second.start({ context: {} }),
  ]);

  const { rerender } = render(
    <PrismProvider flags={first}>
      <Limit />
    </PrismProvider>,
  );

  expect(screen.getByRole("status").textContent).toBe("3");
  rerender(
    <PrismProvider flags={second}>
      <Limit />
    </PrismProvider>,
  );
  expect(screen.getByRole("status").textContent).toBe("12");
  await Promise.all([first.dispose(), second.dispose()]);
});

test("reading by key without a provider is a configuration error", () => {
  expect(() => renderHook(() => useFlag("limit"))).toThrow(PrismError);
  expect(() => renderHook(() => usePrismStatus())).toThrow(
    "Reading flags by key needs a PrismProvider above.",
  );
});

test("renders provided values on the server", async () => {
  const flags = createFlags(5);

  await flags.start({ context: {} });
  expect(
    renderToString(
      <PrismProvider flags={flags}>
        <Limit />
      </PrismProvider>,
    ),
  ).toBe("<output>5</output>");
  await flags.dispose();
});
