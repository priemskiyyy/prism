import { useContext } from "react";
import { PrismContext } from "src/context/PrismContext";
import { getMissingProviderError } from "src/hooks/internal/getMissingProviderError";
import type { RegisteredPrism } from "src/types/Register";

export const usePrism = (): RegisteredPrism => {
  const flags = useContext(PrismContext);

  if (flags === undefined) {
    throw getMissingProviderError();
  }

  return flags;
};
