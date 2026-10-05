import { expect, test, vi } from "vitest";
import { createFlagAdapter } from "src/createFlagAdapter";
import type { AdapterObserver } from "src/types/AdapterObserver";

test("silences the observer after disposal and rejects identify and read", async () => {
  let native: AdapterObserver | undefined;
  const dispose = vi.fn();

  const adapter = createFlagAdapter<Record<string, never>>({
    name: "test",
    open: (observer) => {
      native = observer;

      return { identify: () => {}, read: () => ({}), dispose };
    },
  });

  const invalidate = vi.fn();
  const session = adapter.open({ invalidate });

  native?.invalidate();
  expect(invalidate).toHaveBeenCalledOnce();

  const disposal = session.dispose();

  expect(session.dispose()).toBe(disposal);
  native?.invalidate();
  expect(invalidate).toHaveBeenCalledOnce();
  expect(() => session.identify({})).toThrow("DISPOSED");
  expect(() =>
    session.read({
      context: {},
      flags: [],
      signal: new AbortController().signal,
    }),
  ).toThrow("DISPOSED");
  await disposal;
  expect(dispose).toHaveBeenCalledOnce();
});

test("a failing native disposal rejects the shared promise once", async () => {
  const adapter = createFlagAdapter<Record<string, never>>({
    name: "test",
    open: () => ({
      identify: () => {},
      read: () => ({}),
      dispose: () => {
        throw new Error("native");
      },
    }),
  });

  const session = adapter.open({ invalidate: () => {} });

  await expect(session.dispose()).rejects.toThrow("native");
  await expect(session.dispose()).rejects.toThrow("native");
});
