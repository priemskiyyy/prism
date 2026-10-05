import { inject } from "vue";
import type { ComputedRef } from "vue";
import { getMissingProviderError } from "src/composables/internal/getMissingProviderError";
import type { RegisteredPrism } from "src/types/Register";
import { PRISM_CONTEXT } from "src/utils/constants/prismContext";

export const usePrism = (): ComputedRef<RegisteredPrism> => {
  const provided = inject(PRISM_CONTEXT, undefined);

  if (provided === undefined) {
    throw getMissingProviderError();
  }

  return provided;
};
