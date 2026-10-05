import { createRoot } from "solid-js";
import type { ObservableValue } from "@priemskiyyy/prism";
import { expect, test, vi } from "vitest";
import { useObservableValue } from "src/primitives/internal/useObservableValue";

test("server execution reads the current snapshot without subscribing", () => {
  const subscribe = vi.fn(() => () => {});
  const store: ObservableValue<number> = { get: () => 7, subscribe };

  createRoot((dispose) => {
    expect(useObservableValue(() => store)()).toBe(7);
    dispose();
  });
  expect(subscribe).not.toHaveBeenCalled();
});
