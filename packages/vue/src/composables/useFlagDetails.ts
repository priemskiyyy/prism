import type { ComputedRef, MaybeRefOrGetter } from "vue";
import type { FlagDetails, FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { useFlagHandle } from "src/composables/internal/useFlagHandle";
import { useObservableValue } from "src/composables/internal/useObservableValue";
import type { RegisteredKey, RegisteredValue } from "src/types/Register";

export function useFlagDetails<K extends RegisteredKey>(
  key: MaybeRefOrGetter<K>,
): ComputedRef<FlagDetails<RegisteredValue<K>>>;
export function useFlagDetails<T>(
  handle: MaybeRefOrGetter<FlagHandle<T>>,
): ComputedRef<FlagDetails<T>>;

export function useFlagDetails(
  source: MaybeRefOrGetter<FlagHandle<JsonValue> | RegisteredKey>,
): ComputedRef<FlagDetails<JsonValue>> {
  const handle = useFlagHandle(source);

  return useObservableValue(() => handle().details);
}
