import { afterEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { Prism } from "src/Prism";
import { PrismError } from "src/PrismError";
import { flag } from "src/flag";
import { createMockAdapter } from "src/mock";
import type { StandardResult } from "src/types/StandardResult";
import type { StandardSchema } from "src/types/StandardSchema";
import { flushMicrotasks, identifyAt, readAt } from "src/testing/fixtures";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const evaluations = (values: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, { value }]),
  );

describe("construction and handles", () => {
  test("construction and subscriptions are inert and handles are stable", async () => {
    const adapter = createMockAdapter();

    const flags = new Prism({
      adapter,
      flags: {
        enabled: flag(z.boolean(), { fallback: false, key: "remote-enabled" }),
      },
    });

    const handle = flags.flag("enabled");
    const listener = vi.fn();

    handle.subscribe(listener);
    expect(flags.flag("enabled")).toBe(handle);
    expect(handle.providerKey).toBe("remote-enabled");
    expect(handle.get()).toBe(false);
    expect(handle.details.get()).toEqual({
      value: false,
      resolution: "pending",
    });
    expect(flags.status.get()).toEqual({ state: "idle", refreshing: false });
    expect(adapter.controller.opens).toBe(0);
    expect(listener).not.toHaveBeenCalled();
    await flags.dispose();
  });

  test("rejects undeclared flags, duplicate provider keys and empty keys", () => {
    const flags = new Prism({
      adapter: createMockAdapter(),
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    // @ts-expect-error Only declared keys are accepted.
    expect(() => flags.flag("missing")).toThrow(PrismError);
    expect(
      () =>
        new Prism({
          adapter: createMockAdapter(),
          flags: {
            a: flag(z.boolean(), { fallback: false, key: "same" }),
            b: flag(z.boolean(), { fallback: true, key: "same" }),
          },
        }),
    ).toThrow("same");
    expect(
      () =>
        new Prism({
          adapter: createMockAdapter(),
          flags: { "": flag(z.boolean(), { fallback: false }) },
        }),
    ).toThrow(PrismError);

    for (const timeout of [0, Number.POSITIVE_INFINITY, 3_000_000_000]) {
      expect(
        () =>
          new Prism({
            adapter: createMockAdapter(),
            flags: {},
            timeout,
          }),
      ).toThrow(PrismError);
    }
  });
});

describe("reads and publication", () => {
  test("reads on React Native, whose AbortSignal has no throwIfAborted or reason", async () => {
    class ReactNativeAbortSignal extends EventTarget {
      aborted = false;
    }

    class ReactNativeAbortController {
      signal = new ReactNativeAbortSignal();

      abort() {
        this.signal.aborted = true;
        this.signal.dispatchEvent(new Event("abort"));
      }
    }

    vi.stubGlobal("AbortController", ReactNativeAbortController);

    const flags = new Prism({
      adapter: createMockAdapter({
        evaluate: () => evaluations({ enabled: true }),
      }),
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    await flags.start({ context: {} });
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.status.get()).toEqual({ state: "ready", refreshing: false });
    await flags.dispose();
  });

  test("start opens one session, reads provider keys and publishes values", async () => {
    const adapter = createMockAdapter({
      evaluate: () => evaluations({ "remote-enabled": true }),
    });

    const flags = new Prism({
      adapter,
      flags: {
        enabled: flag(z.boolean(), { fallback: false, key: "remote-enabled" }),
      },
    });

    const values: boolean[] = [];

    flags.flag("enabled").subscribe((value) => {
      values.push(value);
    });
    await flags.start({ context: { user: "a" } });
    expect(adapter.controller.opens).toBe(1);
    expect(readAt(adapter.controller, 0).request).toMatchObject({
      context: { user: "a" },
      flags: [{ key: "remote-enabled", fallback: false }],
    });
    expect(values).toEqual([true]);
    expect(flags.flag("enabled").details.get()).toEqual({
      value: true,
      resolution: "resolved",
    });
    expect(flags.status.get()).toEqual({ state: "ready", refreshing: false });
    await flags.dispose();
  });

  test("installs the whole batch before any listener runs", async () => {
    const adapter = createMockAdapter({
      evaluate: () => evaluations({ first: true, second: 2 }),
    });

    const flags = new Prism({
      adapter,
      flags: {
        first: flag(z.boolean(), { fallback: false }),
        second: flag(z.number(), { fallback: 0 }),
      },
    });

    const seen: unknown[] = [];

    flags.flag("first").subscribe(() => {
      seen.push([flags.flag("second").get(), flags.status.get().state]);
    });
    await flags.start({ context: {} });
    expect(seen).toEqual([[2, "ready"]]);
    await flags.dispose();
  });

  test("equal snapshots keep their reference and share unchanged nested branches", async () => {
    const values: Record<string, unknown> = {
      settings: { stable: { colors: ["red"] }, count: 1 },
    };

    const adapter = createMockAdapter({ evaluate: () => evaluations(values) });

    const flags = new Prism({
      adapter,
      flags: {
        settings: flag(
          z.object({
            stable: z.object({ colors: z.array(z.string()) }),
            count: z.number(),
          }),
          { fallback: { stable: { colors: [] }, count: 0 } },
        ),
      },
    });

    await flags.start({ context: {} });

    const first = flags.flag("settings").get();
    const listener = vi.fn();

    flags.flag("settings").subscribe(listener);
    await flags.refresh();
    expect(flags.flag("settings").get()).toBe(first);
    expect(listener).not.toHaveBeenCalled();
    values.settings = { stable: { colors: ["red"] }, count: 2 };
    await flags.refresh();

    const second = flags.flag("settings").get();

    expect(second).not.toBe(first);
    expect(second.stable).toBe(first.stable);
    expect(second.count).toBe(2);
    expect(Object.isFrozen(second)).toBe(true);
    await flags.dispose();
  });

  test("a throwing or rejecting listener does not starve other listeners", async () => {
    const reported: unknown[] = [];

    vi.spyOn(globalThis, "queueMicrotask").mockImplementation((callback) => {
      reported.push(callback);
    });

    const adapter = createMockAdapter({
      evaluate: () => evaluations({ enabled: true }),
    });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    flags.flag("enabled").subscribe(() => {
      throw new Error("sync");
    });
    flags.flag("enabled").subscribe(() => Promise.reject(new Error("async")));

    const later = vi.fn();

    flags.flag("enabled").subscribe(later);
    await flags.start({ context: {} });
    await Promise.resolve();
    expect(later).toHaveBeenCalledExactlyOnceWith(true);
    expect(reported).toHaveLength(2);
    await flags.dispose();
  });

  test("listeners may unsubscribe peers and subscribe newcomers during publication", async () => {
    const values: Record<string, unknown> = {};
    const adapter = createMockAdapter({ evaluate: () => evaluations(values) });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const calls: string[] = [];

    let stopSecond = () => {};

    let added = false;

    flags.flag("enabled").subscribe(() => {
      calls.push("first");
      stopSecond();

      if (!added) {
        added = true;
        flags.flag("enabled").subscribe(() => {
          calls.push("new");
        });
      }
    });
    stopSecond = flags.flag("enabled").subscribe(() => {
      calls.push("removed");
    });
    values.enabled = true;
    await flags.start({ context: {} });
    expect(calls).toEqual(["first"]);
    values.enabled = false;
    await flags.refresh();
    expect(calls).toEqual(["first", "first", "new"]);
    await flags.dispose();
  });

  test("an unchanged provider value is not validated again and notifies nobody", async () => {
    const validate = vi.fn((value: unknown): StandardResult<boolean> =>
      typeof value === "boolean"
        ? { value }
        : { issues: [{ message: "Expected a boolean" }] },
    );

    const Enabled: StandardSchema<boolean> = {
      "~standard": { version: 1, vendor: "test", validate },
    };

    const adapter = createMockAdapter({
      evaluate: () => evaluations({ enabled: true }),
    });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(Enabled, { fallback: false }) },
    });

    await flags.start({ context: {} });

    const validations = validate.mock.calls.length;
    const details = flags.flag("enabled").details.get();
    const listener = vi.fn();

    flags.flag("enabled").details.subscribe(listener);
    await flags.refresh();
    await flags.refresh();
    expect(validate).toHaveBeenCalledTimes(validations);
    expect(flags.flag("enabled").details.get()).toBe(details);
    expect(listener).not.toHaveBeenCalled();
    await flags.dispose();
  });

  test("a provider value changed in place is read again", async () => {
    const settings = { count: 1 };

    const adapter = createMockAdapter({
      evaluate: () => ({ settings: { value: settings } }),
    });

    const flags = new Prism({
      adapter,
      flags: {
        settings: flag(z.object({ count: z.number() }), {
          fallback: { count: 0 },
        }),
      },
    });

    await flags.start({ context: {} });
    expect(flags.flag("settings").get()).toEqual({ count: 1 });
    settings.count = 2;
    await flags.refresh();
    expect(flags.flag("settings").get()).toEqual({ count: 2 });
    await flags.dispose();
  });

  test("the same value with another variant updates only the details", async () => {
    let variant = "control";

    const adapter = createMockAdapter({
      evaluate: () => ({ layout: { value: "split", variant } }),
    });

    const flags = new Prism({
      adapter,
      flags: { layout: flag(z.string(), { fallback: "classic" }) },
    });

    await flags.start({ context: {} });

    const value = vi.fn();
    const details = vi.fn();

    flags.flag("layout").subscribe(value);
    flags.flag("layout").details.subscribe(details);
    variant = "treatment";
    await flags.refresh();
    expect(flags.flag("layout").details.get().variant).toBe("treatment");
    expect(value).not.toHaveBeenCalled();
    expect(details).toHaveBeenCalledTimes(1);
    await flags.dispose();
  });

  test("an invalid value that keeps arriving keeps its error and notifies nobody", async () => {
    const adapter = createMockAdapter({
      evaluate: () => evaluations({ count: "many" }),
    });

    const flags = new Prism({
      adapter,
      flags: { count: flag(z.number(), { fallback: 1 }) },
    });

    await flags.start({ context: {} });

    const { error } = flags.flag("count").details.get();
    const listener = vi.fn();

    flags.flag("count").details.subscribe(listener);
    await flags.refresh();
    expect(error?.code).toBe("VALIDATION");
    expect(flags.flag("count").details.get().error).toBe(error);
    expect(listener).not.toHaveBeenCalled();
    await flags.dispose();
  });

  test("a new context reads an unchanged value again", async () => {
    const adapter = createMockAdapter({
      evaluate: () => evaluations({ enabled: true }),
    });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    await flags.start({ context: { userId: "a" } });

    const resolutions: string[] = [];

    flags.flag("enabled").details.subscribe(({ resolution }) => {
      resolutions.push(resolution);
    });
    await flags.context({ userId: "b" });
    expect(resolutions).toEqual(["pending", "resolved"]);
    expect(flags.flag("enabled").get()).toBe(true);
    await flags.dispose();
  });

  test("missing, erroring and invalid evaluations fall back individually", async () => {
    const adapter = createMockAdapter({
      evaluate: () => ({
        valid: { value: "ok", variant: "treatment" },
        invalid: { value: 42 },
        failed: { error: new Error("provider") },
      }),
    });

    const flags = new Prism({
      adapter,
      flags: {
        valid: flag(z.string(), { fallback: "fallback" }),
        invalid: flag(z.string(), { fallback: "fallback" }),
        failed: flag(z.string(), { fallback: "fallback" }),
        absent: flag(z.string(), { fallback: "fallback" }),
      },
    });

    await flags.start({ context: {} });
    expect(flags.flag("valid").details.get()).toEqual({
      value: "ok",
      resolution: "resolved",
      variant: "treatment",
    });
    expect(flags.flag("invalid").get()).toBe("fallback");
    expect(flags.flag("invalid").details.get().resolution).toBe("error");
    expect(flags.flag("invalid").details.get().error?.code).toBe("VALIDATION");
    expect(flags.flag("failed").details.get().error?.code).toBe(
      "EVALUATION_FAILED",
    );
    expect(flags.flag("absent").details.get().resolution).toBe("missing");
    expect(flags.status.get().state).toBe("ready");
    await flags.dispose();
  });

  test("a failed read keeps current values and reports the error on status", async () => {
    const adapter = createMockAdapter({
      evaluate: () => evaluations({ enabled: true }),
      manualReads: true,
    });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const startup = flags.start({ context: {} });

    await flushMicrotasks();
    readAt(adapter.controller, 0).resolve();
    await startup;

    const refresh = flags.refresh();

    expect(flags.status.get()).toEqual({ state: "ready", refreshing: true });
    await flushMicrotasks();
    readAt(adapter.controller, 1).reject(new PrismError({ code: "NETWORK" }));
    await expect(refresh).rejects.toMatchObject({ code: "NETWORK" });
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.status.get()).toMatchObject({
      state: "error",
      refreshing: false,
    });
    expect(flags.status.get().error?.code).toBe("NETWORK");
    await flags.dispose();
  });

  test("a read exceeding the timeout fails and its late result is ignored", async () => {
    vi.useFakeTimers();

    const adapter = createMockAdapter({ manualReads: true });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
      timeout: 50,
    });

    const startup = flags.start({ context: {} });

    await flushMicrotasks();
    vi.advanceTimersByTime(50);
    await expect(startup).rejects.toMatchObject({ code: "TIMEOUT" });
    expect(readAt(adapter.controller, 0).request.signal.aborted).toBe(true);
    readAt(adapter.controller, 0).resolve(evaluations({ enabled: true }));
    await flushMicrotasks();
    expect(flags.flag("enabled").get()).toBe(false);
    await flags.dispose();
  });
});

describe("context and scheduling", () => {
  test("context replacement resets values synchronously and a stale read cannot commit", async () => {
    const adapter = createMockAdapter<{ user: string }>({ manualReads: true });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const startup = flags.start({ context: { user: "a" } });

    await flushMicrotasks();
    readAt(adapter.controller, 0).resolve(evaluations({ enabled: true }));
    await startup;

    const replacement = flags.context({ user: "b" });

    expect(flags.flag("enabled").get()).toBe(false);
    expect(flags.flag("enabled").details.get().resolution).toBe("pending");
    expect(flags.status.get()).toEqual({ state: "loading", refreshing: true });

    const stale = flags.refresh();

    await flushMicrotasks();
    expect(adapter.controller.reads).toHaveLength(2);
    expect(readAt(adapter.controller, 1).request.context).toEqual({
      user: "b",
    });

    const third = flags.context({ user: "c" });

    expect(readAt(adapter.controller, 1).request.signal.aborted).toBe(true);
    await expect(stale).resolves.toBeUndefined();
    await expect(replacement).resolves.toBeUndefined();
    readAt(adapter.controller, 1).resolve(evaluations({ enabled: true }));
    await flushMicrotasks();
    expect(flags.flag("enabled").get()).toBe(false);
    readAt(adapter.controller, 2).resolve(evaluations({ enabled: true }));
    await third;
    expect(flags.flag("enabled").get()).toBe(true);
    expect(flags.status.get().state).toBe("ready");
    await flags.dispose();
  });

  test("an equal context joins pending work or resolves immediately when ready", async () => {
    const adapter = createMockAdapter<{ user: string }>({ manualReads: true });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const first = flags.start({ context: { user: "a" } });
    const second = flags.start({ context: { user: "a" } });

    await flushMicrotasks();
    expect(adapter.controller.reads).toHaveLength(1);
    readAt(adapter.controller, 0).resolve();
    await Promise.all([first, second]);
    await flags.context({ user: "a" });
    expect(adapter.controller.reads).toHaveLength(1);
    await flags.dispose();
  });

  test("captures the context before asynchronous work and rejects non-object contexts", async () => {
    const adapter = createMockAdapter<{ user: string; tags?: string[] }>();

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const context = { user: "a", tags: ["x"] };
    const startup = flags.start({ context });

    context.tags.push("mutated");
    await startup;
    expect(readAt(adapter.controller, 0).request.context).toEqual({
      user: "a",
      tags: ["x"],
    });
    expect(Object.isFrozen(readAt(adapter.controller, 0).request.context)).toBe(
      true,
    );

    const untyped = new Prism({
      adapter: createMockAdapter<unknown>(),
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    await expect(untyped.start({ context: [] })).rejects.toMatchObject({
      code: "INVALID_CONTEXT",
    });
    await expect(
      untyped.start({ context: { bad: Number.NaN } }),
    ).rejects.toMatchObject({
      code: "VALIDATION",
    });
    await flags.dispose();
  });

  test("commands require a started runtime", async () => {
    const flags = new Prism({
      adapter: createMockAdapter(),
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    await expect(flags.refresh()).rejects.toMatchObject({
      code: "NOT_STARTED",
    });
    await expect(flags.context({})).rejects.toMatchObject({
      code: "NOT_STARTED",
    });
    await flags.dispose();
  });

  test("an invalidation after the adapter was called queues one trailing read that later waiters join", async () => {
    const adapter = createMockAdapter({ manualReads: true });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const startup = flags.start({ context: {} });

    await flushMicrotasks();
    readAt(adapter.controller, 0).resolve();
    await startup;

    const first = flags.refresh();

    await flushMicrotasks();
    adapter.controller.invalidate();
    adapter.controller.invalidate();

    const second = flags.refresh();
    let secondSettled = false;

    second.then(() => {
      secondSettled = true;
    });
    expect(adapter.controller.reads).toHaveLength(2);
    readAt(adapter.controller, 1).resolve(evaluations({ enabled: true }));
    await first;
    await flushMicrotasks();
    expect(flags.flag("enabled").get()).toBe(true);
    expect(adapter.controller.reads).toHaveLength(3);
    expect(secondSettled).toBe(false);
    readAt(adapter.controller, 2).resolve(evaluations({ enabled: false }));
    await second;
    expect(flags.flag("enabled").get()).toBe(false);
    expect(adapter.controller.reads).toHaveLength(3);
    await flags.dispose();
  });

  test("updates subscribe per context and trigger reads until disposal", async () => {
    const adapter = createMockAdapter<{ org: string }>({
      evaluate: () => evaluations({ enabled: true }),
    });

    const subscriptions: {
      org: string;
      stopped: boolean;
      refresh: () => void;
    }[] = [];

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
      updates: (context, refresh) => {
        const subscription = { org: context.org, stopped: false, refresh };

        subscriptions.push(subscription);

        return () => {
          subscription.stopped = true;
        };
      },
    });

    await flags.start({ context: { org: "a" } });
    expect(subscriptions.map((entry) => entry.org)).toEqual(["a"]);
    subscriptions[0]?.refresh();
    await flushMicrotasks();
    expect(adapter.controller.reads).toHaveLength(2);
    await flags.context({ org: "b" });
    expect(subscriptions[0]?.stopped).toBe(true);
    expect(subscriptions[1]?.org).toBe("b");
    await flags.dispose();
    expect(subscriptions[1]?.stopped).toBe(true);
    subscriptions[1]?.refresh();
    await flushMicrotasks();
    expect(adapter.controller.reads).toHaveLength(3);
  });
});

describe("overrides", () => {
  test("the newest override wins, release reveals the provider value and context change clears leases", async () => {
    const values: Record<string, unknown> = { enabled: true };

    const adapter = createMockAdapter<{ user: string }>({
      evaluate: () => evaluations(values),
    });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    await flags.start({ context: { user: "a" } });

    const releaseFirst = flags.flag("enabled").override(false);

    expect(flags.flag("enabled").details.get()).toEqual({
      value: false,
      resolution: "override",
    });

    const releaseSecond = flags.flag("enabled").override(true);

    releaseFirst();
    expect(flags.flag("enabled").details.get().resolution).toBe("override");
    values.enabled = false;
    await flags.refresh();
    expect(flags.flag("enabled").get()).toBe(true);
    releaseSecond();
    expect(flags.flag("enabled").get()).toBe(false);
    expect(flags.flag("enabled").details.get().resolution).toBe("resolved");

    const release = flags.flag("enabled").override(true);

    await flags.context({ user: "b" });
    expect(flags.flag("enabled").details.get().resolution).toBe("resolved");
    release();
    await flags.dispose();
  });

  test("an invalid override throws and leaves the flag untouched", async () => {
    const flags = new Prism({
      adapter: createMockAdapter({ evaluate: () => evaluations({ count: 2 }) }),
      flags: { count: flag(z.number(), { fallback: 1 }) },
    });

    await flags.start({ context: {} });
    expect(() => flags.flag("count").override(Number.NaN)).toThrow(PrismError);
    expect(flags.flag("count").get()).toBe(2);
    await flags.dispose();
  });
});

describe("disposal", () => {
  test("disposal is immediate, idempotent, rejects waiters and ignores late results", async () => {
    let released = false;

    const adapter = createMockAdapter({
      manualReads: true,
      onDispose: async () => {
        await Promise.resolve();
        released = true;
      },
    });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const startup = flags.start({ context: {} });

    await flushMicrotasks();

    const listener = vi.fn();

    flags.flag("enabled").subscribe(listener);

    const disposal = flags.dispose();

    expect(flags.dispose()).toBe(disposal);
    expect(flags.status.get()).toEqual({
      state: "disposed",
      refreshing: false,
    });
    expect(released).toBe(false);
    await expect(startup).rejects.toMatchObject({ code: "DISPOSED" });
    readAt(adapter.controller, 0).resolve(evaluations({ enabled: true }));
    await disposal;
    expect(released).toBe(true);
    expect(adapter.controller.disposals).toBe(1);
    expect(adapter.controller.observers).toBe(0);
    expect(flags.flag("enabled").get()).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    await expect(flags.refresh()).rejects.toMatchObject({ code: "DISPOSED" });
    expect(() => flags.flag("enabled").override(true)).toThrow(PrismError);
    expect(flags.flag("enabled").subscribe(listener)).toBeTypeOf("function");
  });

  test("disposing from inside a listener stops the remaining batch", async () => {
    const adapter = createMockAdapter({
      evaluate: () => evaluations({ first: true, second: true }),
    });

    const flags = new Prism({
      adapter,
      flags: {
        first: flag(z.boolean(), { fallback: false }),
        second: flag(z.boolean(), { fallback: false }),
      },
    });

    const second = vi.fn();

    flags.flag("first").subscribe(() => {
      flags.dispose();
    });
    flags.flag("second").subscribe(second);
    await expect(flags.start({ context: {} })).resolves.toBeUndefined();
    expect(second).not.toHaveBeenCalled();
    expect(flags.flag("second").get()).toBe(true);
  });
});

describe("adapter identity", () => {
  test("identifies each context once, before its first read", async () => {
    const adapter = createMockAdapter<{ user: string }>({
      manualIdentifies: true,
    });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const startup = flags.start({ context: { user: "a" } });

    await flushMicrotasks();
    expect(identifyAt(adapter.controller, 0).context).toEqual({ user: "a" });
    expect(adapter.controller.reads).toHaveLength(0);
    identifyAt(adapter.controller, 0).resolve();
    await startup;
    await flags.refresh();
    expect(adapter.controller.identifies).toHaveLength(1);
    expect(adapter.controller.reads).toHaveLength(2);
    await flags.dispose();
  });

  test("a failed identify fails its read and the next read retries it", async () => {
    const adapter = createMockAdapter({ manualIdentifies: true });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const startup = flags.start({ context: {} });

    await flushMicrotasks();
    identifyAt(adapter.controller, 0).reject(
      new PrismError({ code: "NETWORK" }),
    );
    await expect(startup).rejects.toMatchObject({ code: "NETWORK" });
    expect(adapter.controller.reads).toHaveLength(0);

    const retry = flags.refresh();

    await flushMicrotasks();
    expect(adapter.controller.identifies).toHaveLength(2);
    identifyAt(adapter.controller, 1).resolve();
    await retry;
    expect(flags.status.get().state).toBe("ready");
    await flags.dispose();
  });

  test("identify calls never overlap and a context replaced while queued is skipped", async () => {
    const adapter = createMockAdapter<{ user: string }>({
      manualIdentifies: true,
    });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const first = flags.start({ context: { user: "a" } });

    await flushMicrotasks();

    const second = flags.context({ user: "b" });
    const third = flags.context({ user: "c" });

    await flushMicrotasks();
    expect(adapter.controller.identifies).toHaveLength(1);
    identifyAt(adapter.controller, 0).resolve();
    await flushMicrotasks();
    expect(adapter.controller.identifies.map((entry) => entry.context)).toEqual(
      [{ user: "a" }, { user: "c" }],
    );
    identifyAt(adapter.controller, 1).resolve();
    await Promise.all([first, second, third]);
    expect(
      adapter.controller.reads.map((read) => read.request.context),
    ).toEqual([{ user: "c" }]);
    await flags.dispose();
  });

  test("an invalidation that arrives before the adapter is called joins that read", async () => {
    const adapter = createMockAdapter({ manualIdentifies: true });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const startup = flags.start({ context: {} });

    await flushMicrotasks();
    adapter.controller.invalidate();
    adapter.controller.invalidate();
    identifyAt(adapter.controller, 0).resolve();
    await startup;
    await flushMicrotasks();
    expect(adapter.controller.reads).toHaveLength(1);
    await flags.dispose();
  });

  test("disposal waits for a pending identify before disposing the session", async () => {
    const adapter = createMockAdapter({ manualIdentifies: true });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    const startup = flags.start({ context: {} });

    await flushMicrotasks();

    const disposal = flags.dispose();

    await expect(startup).rejects.toMatchObject({ code: "DISPOSED" });
    await flushMicrotasks();
    expect(adapter.controller.disposals).toBe(0);
    identifyAt(adapter.controller, 0).resolve();
    await disposal;
    expect(adapter.controller.disposals).toBe(1);
    expect(adapter.controller.reads).toHaveLength(0);
  });
});

describe("misbehaving external code", () => {
  const captureReportedErrors = () => {
    const reported: unknown[] = [];

    vi.spyOn(globalThis, "queueMicrotask").mockImplementation((callback) => {
      reported.push(callback);
    });

    return reported;
  };

  test("a throwing updates subscription is reported and the context change still completes", async () => {
    const reported = captureReportedErrors();

    const adapter = createMockAdapter<{ user: string }>({
      evaluate: ({ context }) => evaluations({ enabled: context.user === "b" }),
      manualReads: true,
    });

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
      updates: (context) => {
        if (context.user === "b") {
          throw new Error("subscribe failed");
        }

        return () => {};
      },
    });

    const startup = flags.start({ context: { user: "a" } });

    await flushMicrotasks();
    readAt(adapter.controller, 0).resolve();
    await startup;

    const superseded = flags.refresh();
    const replacement = flags.context({ user: "b" });

    expect(flags.flag("enabled").details.get().resolution).toBe("pending");
    await expect(superseded).resolves.toBeUndefined();
    await flushMicrotasks();
    readAt(adapter.controller, 1).resolve();
    await replacement;
    expect(flags.flag("enabled").get()).toBe(true);
    expect(adapter.controller.reads[1]?.request.context).toEqual({ user: "b" });
    expect(reported).toHaveLength(1);
    await flags.dispose();
  });

  test("a throwing updates subscription during start still lets dispose release the session", async () => {
    captureReportedErrors();

    const adapter = createMockAdapter();

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
      updates: () => {
        throw new Error("subscribe failed");
      },
    });

    await flags.start({ context: {} });
    await flags.dispose();
    expect(adapter.controller.disposals).toBe(1);
    expect(adapter.controller.observers).toBe(0);
  });

  test("a throwing updates unsubscribe is reported and disposal still completes", async () => {
    const reported = captureReportedErrors();
    const adapter = createMockAdapter();

    const flags = new Prism({
      adapter,
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
      updates: () => () => {
        throw new Error("unsubscribe failed");
      },
    });

    await flags.start({ context: {} });
    await expect(flags.dispose()).resolves.toBeUndefined();
    expect(adapter.controller.disposals).toBe(1);
    expect(reported).toHaveLength(1);
  });

  test("disposing from inside the updates callback still stops the subscription it returns", async () => {
    const stop = vi.fn();

    const flags = new Prism({
      adapter: createMockAdapter(),
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
      updates: () => {
        flags.dispose().catch(() => {});

        return stop;
      },
    });

    await expect(flags.start({ context: {} })).rejects.toMatchObject({
      code: "DISPOSED",
    });
    await flushMicrotasks();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  test("a read result that is not an object fails the read instead of hanging", async () => {
    const flags = new Prism({
      adapter: createMockAdapter({ evaluate: () => JSON.parse("null") }),
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    await expect(flags.start({ context: {} })).rejects.toMatchObject({
      code: "EVALUATION_FAILED",
    });
    expect(flags.status.get()).toMatchObject({
      state: "error",
      refreshing: false,
    });
    await flags.dispose();
  });

  test("a malformed entry fails only its own flag", async () => {
    const flags = new Prism({
      adapter: createMockAdapter({
        evaluate: () =>
          JSON.parse('{ "broken": null, "count": { "value": 2 } }'),
      }),
      flags: {
        broken: flag(z.boolean(), { fallback: false }),
        count: flag(z.number(), { fallback: 0 }),
      },
    });

    await flags.start({ context: {} });
    expect(flags.flag("broken").details.get()).toMatchObject({
      resolution: "error",
      error: { code: "VALIDATION", key: "broken" },
    });
    expect(flags.flag("count").get()).toBe(2);
    await flags.dispose();
  });

  test("a malformed entry after a resolved value fails only its own flag", async () => {
    let entries = '{ "broken": { "value": true }, "count": { "value": 1 } }';

    const flags = new Prism({
      adapter: createMockAdapter({ evaluate: () => JSON.parse(entries) }),
      flags: {
        broken: flag(z.boolean(), { fallback: false }),
        count: flag(z.number(), { fallback: 0 }),
      },
    });

    await flags.start({ context: {} });
    entries = '{ "broken": null, "count": { "value": 2 } }';
    await flags.refresh();
    expect(flags.flag("broken").details.get()).toMatchObject({
      resolution: "error",
      error: { code: "VALIDATION", key: "broken" },
    });
    expect(flags.flag("count").get()).toBe(2);
    await flags.dispose();
  });

  test("flags named after object built-ins stay missing when the provider omits them", async () => {
    const flags = new Prism({
      adapter: createMockAdapter(),
      flags: {
        constructor: flag(z.boolean(), { fallback: false }),
        toString: flag(z.string(), { fallback: "fallback" }),
      },
    });

    await flags.start({ context: {} });
    expect(flags.flag("constructor").details.get().resolution).toBe("missing");
    expect(flags.flag("toString").details.get().resolution).toBe("missing");
    await flags.dispose();
  });

  test("a raw provider error on one flag carries that flag's key", async () => {
    const flags = new Prism({
      adapter: createMockAdapter({
        evaluate: () => ({ enabled: { error: new Error("provider") } }),
      }),
      flags: { enabled: flag(z.boolean(), { fallback: false }) },
    });

    await flags.start({ context: {} });
    expect(flags.flag("enabled").details.get().error).toMatchObject({
      code: "EVALUATION_FAILED",
      key: "enabled",
    });
    await flags.dispose();
  });
});
