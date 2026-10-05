import { PrismError } from "src/PrismError";
import { copyJson, isJsonEqual } from "src/internal/json";
import type { FlagDefinition } from "src/types/FlagDefinition";
import type { JsonValue } from "src/types/JsonValue";
import type { StandardIssue } from "src/types/StandardIssue";
import type { StandardSchema } from "src/types/StandardSchema";

export type FlagOptions<T> = { fallback: NoInfer<T>; key?: string };

const createValidationError = (message: string, cause?: unknown) =>
  new PrismError({ code: "VALIDATION", message, cause });

const getIssueMessage = (issue: StandardIssue | undefined) => {
  if (issue === undefined) {
    return "The value does not satisfy the flag schema.";
  }

  const { message, path = [] } = issue;

  const segments = [...path].map((segment) =>
    (typeof segment === "object" ? segment.key : segment).toString(),
  );

  if (segments.length === 0) {
    return message;
  }

  return `${message} at ${segments.join(".")}`;
};

const getSchemaValidator =
  <T extends JsonValue>(schema: StandardSchema<T>) =>
  (input: unknown): T => {
    const copy = copyJson(input);
    const result = schema["~standard"].validate(copy);

    if ("then" in result) {
      Promise.resolve(result).catch(() => {});
      throw createValidationError("Flag schemas must validate synchronously.");
    }

    if (result.issues !== undefined) {
      const issues = [...result.issues];

      throw createValidationError(getIssueMessage(issues[0]), issues);
    }

    if (isJsonEqual(copy, result.value)) {
      return copy;
    }

    return copyJson(result.value);
  };

const getDeclaredFallback = <T extends JsonValue>(
  fallback: T,
  validate: (input: unknown) => T,
): T => {
  try {
    return validate(fallback);
  } catch (cause) {
    throw new PrismError({
      code: "INVALID_CONFIGURATION",
      message: "The fallback does not satisfy the flag schema.",
      cause,
    });
  }
};

export const flag = <T extends JsonValue>(
  schema: StandardSchema<T>,
  { fallback, key }: FlagOptions<T>,
): FlagDefinition<T> => {
  const validate = getSchemaValidator(schema);

  return Object.freeze({
    fallback: getDeclaredFallback(fallback, validate),
    validate,
    ...(key === undefined ? {} : { key }),
  });
};
