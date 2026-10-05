import type { ObservableValue, PrismStatus } from "@priemskiyyy/prism";
import type { Readable } from "svelte/store";
import { getPrism } from "src/context/getPrism";
import { observableStore } from "src/stores/internal/observableStore";

type RuntimeStatus = { status: ObservableValue<PrismStatus> };
type StatusSelector<Selection> = (value: PrismStatus) => Selection;

export function prismStatusStore(): Readable<PrismStatus>;
export function prismStatusStore<Selection>(
  select: StatusSelector<Selection>,
): Readable<Selection>;
export function prismStatusStore(runtime: RuntimeStatus): Readable<PrismStatus>;
export function prismStatusStore<Selection>(
  runtime: RuntimeStatus,
  select: StatusSelector<Selection>,
): Readable<Selection>;

export function prismStatusStore(
  source?: RuntimeStatus | StatusSelector<unknown>,
  select?: StatusSelector<unknown>,
): Readable<unknown> {
  if (typeof source === "object") {
    return observableStore(source.status, select);
  }

  return observableStore(getPrism().status, source);
}
