import type { Accessor } from "solid-js";
import type { FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { useFlagHandle } from "src/primitives/internal/useFlagHandle";
import { useObservableValue } from "src/primitives/internal/useObservableValue";
import type { RegisteredKey, RegisteredValue } from "src/types/Register";

export function useFlag<K extends RegisteredKey>(
  key: K | Accessor<K>,
): Accessor<RegisteredValue<K>>;
export function useFlag<T>(
  handle: FlagHandle<T> | Accessor<FlagHandle<T>>,
): Accessor<T>;

export function useFlag(
  source:
    | FlagHandle<JsonValue>
    | RegisteredKey
    | Accessor<FlagHandle<JsonValue> | RegisteredKey>,
): Accessor<JsonValue> {
  return useObservableValue(useFlagHandle(source));
}
