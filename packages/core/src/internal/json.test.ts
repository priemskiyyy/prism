import fc from "fast-check";
import type { GeneratorValue } from "fast-check";
import { describe, expect, test } from "vitest";
import { PrismError } from "src/PrismError";
import {
  copyJson,
  isJsonEqual,
  isObjectLike,
  shareJson,
} from "src/internal/json";

const at = (value: unknown, key: string | number): unknown => {
  if (!isObjectLike(value) || !Object.hasOwn(value, key)) {
    return undefined;
  }

  return Reflect.get(value, key);
};

const isDeepFrozen = (value: unknown): boolean => {
  if (!isObjectLike(value)) {
    return true;
  }

  if (!Object.isFrozen(value)) {
    return false;
  }

  return Object.values(value).every((child) => isDeepFrozen(child));
};

const punchHole = (items: unknown[], hole: number) => {
  const sparse: unknown[] = [];

  sparse.length = items.length;

  for (const [index, item] of items.entries()) {
    if (index !== hole) {
      sparse[index] = item;
    }
  }

  return sparse;
};

const mutate = (value: unknown, g: GeneratorValue): unknown => {
  const choice = g(fc.nat, { max: 15 });

  if (choice === 0) {
    return undefined;
  }

  if (choice === 1) {
    return new Date(0);
  }

  if (choice === 2) {
    return g(fc.jsonValue, { maxDepth: 1 });
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => mutate(item, g));

    if (choice !== 3 || items.length === 0) {
      return items;
    }

    return punchHole(items, g(fc.nat, { max: items.length - 1 }));
  }

  if (!isObjectLike(value)) {
    return value;
  }

  const entries: [string, unknown][] = Object.entries(value).map(
    ([key, child]) => [key, mutate(child, g)],
  );

  if (choice === 4) {
    entries.push(["added", undefined]);
  }

  if (choice === 5) {
    entries.reverse();
  }

  return Object.fromEntries(entries);
};

const expectShared = (previous: unknown, next: unknown, shared: unknown) => {
  if (isJsonEqual(previous, next)) {
    expect(shared).toBe(previous);

    return;
  }

  if (!isObjectLike(previous) || !isObjectLike(next)) {
    return;
  }

  if (Array.isArray(previous) !== Array.isArray(next)) {
    return;
  }

  for (const key of Object.keys(next)) {
    expectShared(at(previous, key), at(next, key), at(shared, key));
  }
};

describe("copyJson", () => {
  test("returns strings, booleans, null and finite numbers as they are", () => {
    expect(copyJson("split")).toBe("split");
    expect(copyJson(true)).toBe(true);
    expect(copyJson(null)).toBeNull();
    expect(copyJson(1.5)).toBe(1.5);
    expect(Object.is(copyJson(-0), 0)).toBe(true);
  });

  test("copies and deeply freezes objects and arrays", () => {
    const input = { limits: { maxFiles: 3 }, channels: ["sms"] };
    const copy = copyJson(input);

    expect(copy).toEqual(input);
    expect(copy).not.toBe(input);
    expect(Object.isFrozen(copy)).toBe(true);
    expect(Object.isFrozen(Reflect.get(copy, "limits"))).toBe(true);
    expect(Object.isFrozen(Reflect.get(copy, "channels"))).toBe(true);
  });

  test("follows JSON for dates, undefined properties and holes", () => {
    const date = new Date("2026-09-23T10:00:00.000Z");

    expect(copyJson(date)).toBe("2026-09-23T10:00:00.000Z");
    expect(copyJson({ kept: 1, dropped: undefined })).toEqual({ kept: 1 });
    expect(copyJson([1, undefined, 3])).toEqual([1, null, 3]);
  });

  test("rejects values JSON cannot carry", () => {
    for (const input of [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      undefined,
      () => 1,
      Symbol("flag"),
      1n,
      { nested: Number.NaN },
    ]) {
      expect(() => copyJson(input)).toThrow(PrismError);
    }
  });

  test("reads any JSON value the way JSON.parse would and freezes it", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const copy = copyJson(value);

        expect(copy).toEqual(JSON.parse(JSON.stringify(value)));
        expect(isDeepFrozen(copy)).toBe(true);
      }),
    );
  });

  test("writes the same JSON as any input it accepts", () => {
    const anything = fc.anything({
      withBigInt: true,
      withDate: true,
      withMap: true,
      withNullPrototype: true,
      withSparseArray: true,
    });

    fc.assert(
      fc.property(anything, (value) => {
        let copy: unknown;

        try {
          copy = copyJson(value);
        } catch (error) {
          expect(error).toBeInstanceOf(PrismError);

          return;
        }

        expect(JSON.stringify(copy)).toBe(JSON.stringify(value));
      }),
    );
  });
});

describe("isJsonEqual", () => {
  test("compares values, arrays and objects by content", () => {
    expect(isJsonEqual({ a: [1, { b: "x" }] }, { a: [1, { b: "x" }] })).toBe(
      true,
    );
    expect(isJsonEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(isJsonEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isJsonEqual({ a: 1 }, [1])).toBe(false);
    expect(isJsonEqual(null, {})).toBe(false);
  });

  test("treats a different key order as a different value", () => {
    expect(isJsonEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(false);
  });

  test("never equates values that JSON would change", () => {
    const holes: unknown[] = [];

    holes[1] = 1;
    expect(isJsonEqual({}, new Date(0))).toBe(false);
    expect(isJsonEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(isJsonEqual([1, null], [1, undefined])).toBe(false);
    expect(isJsonEqual(holes, [5, 1])).toBe(false);
    expect(isJsonEqual(0, -0)).toBe(false);
  });

  test("a value equal to a copy always writes the same JSON", () => {
    fc.assert(
      fc.property(fc.jsonValue(), fc.gen(), (value, g) => {
        const copy = copyJson(value);
        const candidate = mutate(value, g);

        if (!isJsonEqual(candidate, copy)) {
          return;
        }

        expect(JSON.stringify(candidate)).toBe(JSON.stringify(copy));
      }),
      { numRuns: 1000 },
    );
  });

  test("a JSON reading of a copy is equal to it", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const copy = copyJson(value);

        expect(isJsonEqual(JSON.parse(JSON.stringify(copy)), copy)).toBe(true);
      }),
    );
  });
});

describe("shareJson", () => {
  test("keeps the previous reference for an equal value", () => {
    const previous = copyJson({ stable: { colors: ["red"] }, count: 1 });

    expect(
      shareJson(previous, copyJson({ stable: { colors: ["red"] }, count: 1 })),
    ).toBe(previous);
  });

  test("shares unchanged branches of a changed value and freezes new ones", () => {
    const previous = copyJson({
      stable: { colors: ["red"] },
      rows: [{ id: 1 }, { id: 2 }],
    });

    const next = shareJson(
      previous,
      copyJson({ stable: { colors: ["red"] }, rows: [{ id: 1 }, { id: 3 }] }),
    );

    expect(next).not.toBe(previous);
    expect(at(next, "stable")).toBe(at(previous, "stable"));
    expect(at(at(next, "rows"), 0)).toBe(at(at(previous, "rows"), 0));
    expect(at(at(next, "rows"), 1)).toEqual({ id: 3 });
    expect(Object.isFrozen(next)).toBe(true);
    expect(Object.isFrozen(at(next, "rows"))).toBe(true);
  });

  test("takes the new key order when keys are reordered", () => {
    const next = shareJson(copyJson({ a: 1, b: 2 }), copyJson({ b: 2, a: 1 }));

    expect(next).toEqual({ b: 2, a: 1 });
    expect(JSON.stringify(next)).toBe('{"b":2,"a":1}');
  });

  test("keeps every branch that did not change and matches the next value", () => {
    fc.assert(
      fc.property(fc.jsonValue(), fc.gen(), (value, g) => {
        const candidate = mutate(value, g);

        if (candidate === undefined) {
          return;
        }

        const previous = copyJson(value);
        const next = copyJson(candidate);
        const shared = shareJson(previous, next);

        expect(shared).toEqual(next);
        expect(isDeepFrozen(shared)).toBe(true);
        expectShared(previous, next, shared);
      }),
      { numRuns: 500 },
    );
  });
});
