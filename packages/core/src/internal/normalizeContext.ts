import { PrismError } from "src/PrismError";
import { copyJson, isObjectLike } from "src/internal/json";

export function normalizeContext<C>(input: C): C;

export function normalizeContext(input: unknown): unknown {
  const context = copyJson(input);

  if (!isObjectLike(context) || Array.isArray(context)) {
    throw new PrismError({
      code: "INVALID_CONTEXT",
      message: "A context must be a plain JSON object.",
    });
  }

  return context;
}
