import type { JsonValue } from "src/types/JsonValue";

export type FlagDefinition<T extends JsonValue = JsonValue> = {
  fallback: T;
  key?: string;
  validate: (value: unknown) => T;
};
