import { getContext } from "svelte";
import { getMissingProviderError } from "src/context/internal/getMissingProviderError";
import type { RegisteredPrism } from "src/types/Register";
import { PRISM_CONTEXT } from "src/utils/constants/prismContext";

export const getPrism = (key?: string): RegisteredPrism => {
  const flags = getContext<(() => RegisteredPrism) | undefined>(PRISM_CONTEXT);

  if (flags === undefined) {
    throw getMissingProviderError(key);
  }

  return flags();
};
