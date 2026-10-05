import { PrismError } from "src/PrismError";
import type { JsonValue } from "src/types/JsonValue";

export const isObjectLike = (value: unknown): value is object =>
  value !== null && typeof value === "object";

const createJsonError = (cause?: unknown) =>
  new PrismError({
    code: "VALIDATION",
    message: "Expected finite JSON data.",
    cause,
  });

const rejectNonFinite = (_key: string, value: unknown) => {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new TypeError("Non-finite number");
  }

  return value;
};

const deepFreeze = (value: JsonValue): JsonValue => {
  if (!isObjectLike(value)) {
    return value;
  }

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  Object.freeze(value);

  return value;
};

const copyPrimitive = (input: unknown): JsonValue => {
  if (
    input === null ||
    typeof input === "string" ||
    typeof input === "boolean"
  ) {
    return input;
  }

  if (typeof input === "number" && Number.isFinite(input)) {
    return input === 0 ? 0 : input;
  }

  throw createJsonError();
};

const copyObject = (input: object): JsonValue => {
  try {
    const text = JSON.stringify(input, rejectNonFinite);

    if (text === undefined) {
      throw new TypeError("Not JSON");
    }

    return deepFreeze(JSON.parse(text));
  } catch (cause) {
    throw createJsonError(cause);
  }
};

export function copyJson<T extends JsonValue>(input: T): T;
export function copyJson(input: unknown): JsonValue;

export function copyJson(input: unknown): JsonValue {
  if (!isObjectLike(input)) {
    return copyPrimitive(input);
  }

  return copyObject(input);
}

const areItemsEqual = (left: unknown[], right: unknown[]) => {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (!isJsonEqual(left[index], right[index])) {
      return false;
    }
  }

  return true;
};

const areEntriesEqual = (left: object, right: object) => {
  const keys = Object.keys(left);
  const otherKeys = Object.keys(right);

  if (keys.length !== otherKeys.length) {
    return false;
  }

  for (const [index, key] of keys.entries()) {
    if (otherKeys[index] !== key) {
      return false;
    }

    if (!isJsonEqual(Reflect.get(left, key), Reflect.get(right, key))) {
      return false;
    }
  }

  return true;
};

export const isJsonEqual = <T>(left: unknown, right: T): left is T => {
  if (Object.is(left, right)) {
    return true;
  }

  if (!isObjectLike(left) || !isObjectLike(right)) {
    return false;
  }

  if ("toJSON" in left || "toJSON" in right) {
    return false;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return areItemsEqual(left, right);
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    return false;
  }

  return areEntriesEqual(left, right);
};

const getOwn = (value: object, key: string): unknown => {
  if (!Object.hasOwn(value, key)) {
    return undefined;
  }

  return Reflect.get(value, key);
};

export const shareJson = (previous: unknown, next: unknown): unknown => {
  if (isJsonEqual(previous, next)) {
    return previous;
  }

  if (!isObjectLike(previous) || !isObjectLike(next)) {
    return next;
  }

  if (Array.isArray(previous) !== Array.isArray(next)) {
    return next;
  }

  if (Array.isArray(next)) {
    return Object.freeze(
      next.map((child, index) =>
        shareJson(Reflect.get(previous, index), child),
      ),
    );
  }

  return Object.freeze(
    Object.fromEntries(
      Object.entries(next).map(([key, child]) => [
        key,
        shareJson(getOwn(previous, key), child),
      ]),
    ),
  );
};
