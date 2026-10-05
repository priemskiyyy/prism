import { useContext } from "solid-js";
import type { Accessor } from "solid-js";
import type { ObservableValue, PrismStatus } from "@priemskiyyy/prism";
import { PrismContext } from "src/context/PrismContext";
import { getMissingProviderError } from "src/primitives/internal/getMissingProviderError";
import { useObservableValue } from "src/primitives/internal/useObservableValue";

type RuntimeStatus = { status: ObservableValue<PrismStatus> };

export function usePrismStatus(
  runtime?: RuntimeStatus | Accessor<RuntimeStatus>,
): Accessor<PrismStatus> {
  const provided = useContext(PrismContext);

  return useObservableValue(() => {
    if (runtime !== undefined) {
      return (typeof runtime === "function" ? runtime() : runtime).status;
    }

    if (provided === undefined) {
      throw getMissingProviderError();
    }

    return provided().status;
  });
}
