import { useContext } from "solid-js";
import type { Accessor } from "solid-js";
import { PrismContext } from "src/context/PrismContext";
import { getMissingProviderError } from "src/primitives/internal/getMissingProviderError";
import type { RegisteredPrism } from "src/types/Register";

export const usePrism = (): Accessor<RegisteredPrism> => {
  const provided = useContext(PrismContext);

  if (provided === undefined) {
    throw getMissingProviderError();
  }

  return provided;
};
