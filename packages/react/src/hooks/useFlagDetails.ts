import type { FlagDetails, FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { useFlagHandle } from "src/hooks/internal/useFlagHandle";
import { useObservableValue } from "src/hooks/internal/useObservableValue";
import type { RegisteredKey, RegisteredValue } from "src/types/Register";

export function useFlagDetails<T>(handle: FlagHandle<T>): FlagDetails<T>;
export function useFlagDetails<T, Selection>(
  handle: FlagHandle<T>,
  selector: (value: FlagDetails<T>) => Selection,
): Selection;
export function useFlagDetails<K extends RegisteredKey>(
  key: K,
): FlagDetails<RegisteredValue<K>>;
export function useFlagDetails<K extends RegisteredKey, Selection>(
  key: K,
  selector: (value: FlagDetails<RegisteredValue<K>>) => Selection,
): Selection;

export function useFlagDetails(
  source: FlagHandle<JsonValue> | RegisteredKey,
  selector?: (value: FlagDetails<JsonValue>) => unknown,
): unknown {
  return useObservableValue(useFlagHandle(source).details, selector);
}
