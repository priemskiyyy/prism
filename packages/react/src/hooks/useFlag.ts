import type { FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { useFlagHandle } from "src/hooks/internal/useFlagHandle";
import { useObservableValue } from "src/hooks/internal/useObservableValue";
import type { RegisteredKey, RegisteredValue } from "src/types/Register";

export function useFlag<T>(handle: FlagHandle<T>): T;
export function useFlag<T, Selection>(
  handle: FlagHandle<T>,
  selector: (value: T) => Selection,
): Selection;
export function useFlag<K extends RegisteredKey>(key: K): RegisteredValue<K>;
export function useFlag<K extends RegisteredKey, Selection>(
  key: K,
  selector: (value: RegisteredValue<K>) => Selection,
): Selection;

export function useFlag(
  source: FlagHandle<JsonValue> | RegisteredKey,
  selector?: (value: JsonValue) => unknown,
): unknown {
  return useObservableValue(useFlagHandle(source), selector);
}
