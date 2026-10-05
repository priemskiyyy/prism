import { inject, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";
import type { FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { getMissingProviderError } from "src/composables/internal/getMissingProviderError";
import type { RegisteredKey } from "src/types/Register";
import { PRISM_CONTEXT } from "src/utils/constants/prismContext";

export const useFlagHandle = (
  source: MaybeRefOrGetter<FlagHandle<JsonValue> | RegisteredKey>,
) => {
  const provided = inject(PRISM_CONTEXT, undefined);

  return (): FlagHandle<JsonValue> => {
    const current = toValue(source);

    if (typeof current !== "string") {
      return current;
    }

    if (provided === undefined) {
      throw getMissingProviderError(current);
    }

    return provided.value.flag(current);
  };
};
