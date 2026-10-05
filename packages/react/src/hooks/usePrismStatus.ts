import { useContext } from "react";
import type { ObservableValue, PrismStatus } from "@priemskiyyy/prism";
import { PrismContext } from "src/context/PrismContext";
import { getMissingProviderError } from "src/hooks/internal/getMissingProviderError";
import { useObservableValue } from "src/hooks/internal/useObservableValue";

type RuntimeStatus = { status: ObservableValue<PrismStatus> };
type StatusSelector<Selection> = (value: PrismStatus) => Selection;

export function usePrismStatus(): PrismStatus;
export function usePrismStatus<Selection>(
  selector: StatusSelector<Selection>,
): Selection;
export function usePrismStatus(runtime: RuntimeStatus): PrismStatus;
export function usePrismStatus<Selection>(
  runtime: RuntimeStatus,
  selector: StatusSelector<Selection>,
): Selection;

export function usePrismStatus(
  source?: RuntimeStatus | StatusSelector<unknown>,
  selector?: StatusSelector<unknown>,
): unknown {
  const provided = useContext(PrismContext);
  const runtime = typeof source === "object" ? source : provided;

  if (runtime === undefined) {
    throw getMissingProviderError();
  }

  return useObservableValue(
    runtime.status,
    typeof source === "function" ? source : selector,
  );
}
