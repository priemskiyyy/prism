import { inject, toValue } from "vue";
import type { ComputedRef, MaybeRefOrGetter } from "vue";
import type { ObservableValue, PrismStatus } from "@priemskiyyy/prism";
import { getMissingProviderError } from "src/composables/internal/getMissingProviderError";
import { useObservableValue } from "src/composables/internal/useObservableValue";
import { PRISM_CONTEXT } from "src/utils/constants/prismContext";

type RuntimeStatus = { status: ObservableValue<PrismStatus> };

export function usePrismStatus(
  runtime?: MaybeRefOrGetter<RuntimeStatus>,
): ComputedRef<PrismStatus> {
  const provided = inject(PRISM_CONTEXT, undefined);

  return useObservableValue(() => {
    const current = runtime === undefined ? provided?.value : toValue(runtime);

    if (current === undefined) {
      throw getMissingProviderError();
    }

    return current.status;
  });
}
