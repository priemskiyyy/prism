import type { ComputedRef, MaybeRefOrGetter } from "vue";
import type { FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { useFlagHandle } from "src/composables/internal/useFlagHandle";
import { useObservableValue } from "src/composables/internal/useObservableValue";
import type { RegisteredKey, RegisteredValue } from "src/types/Register";

export function useFlag<K extends RegisteredKey>(
  key: MaybeRefOrGetter<K>,
): ComputedRef<RegisteredValue<K>>;
export function useFlag<T>(
  handle: MaybeRefOrGetter<FlagHandle<T>>,
): ComputedRef<T>;

export function useFlag(
  source: MaybeRefOrGetter<FlagHandle<JsonValue> | RegisteredKey>,
): ComputedRef<JsonValue> {
  return useObservableValue(useFlagHandle(source));
}
