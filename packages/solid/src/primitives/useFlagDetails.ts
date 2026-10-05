import type { Accessor } from "solid-js";
import type { FlagDetails, FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { useFlagHandle } from "src/primitives/internal/useFlagHandle";
import { useObservableValue } from "src/primitives/internal/useObservableValue";
import type { RegisteredKey, RegisteredValue } from "src/types/Register";

export function useFlagDetails<K extends RegisteredKey>(
  key: K | Accessor<K>,
): Accessor<FlagDetails<RegisteredValue<K>>>;
export function useFlagDetails<T>(
  handle: FlagHandle<T> | Accessor<FlagHandle<T>>,
): Accessor<FlagDetails<T>>;

export function useFlagDetails(
  source:
    | FlagHandle<JsonValue>
    | RegisteredKey
    | Accessor<FlagHandle<JsonValue> | RegisteredKey>,
): Accessor<FlagDetails<JsonValue>> {
  const handle = useFlagHandle(source);

  return useObservableValue(() => handle().details);
}
