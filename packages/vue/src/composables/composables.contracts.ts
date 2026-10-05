import { expectTypeOf } from "vitest";
import type {
  FlagDetails,
  FlagHandle,
  ObservableValue,
  PrismStatus,
} from "@priemskiyyy/prism";
import type { ComputedRef } from "vue";
import { useFlag } from "src/composables/useFlag";
import { useFlagDetails } from "src/composables/useFlagDetails";
import { usePrismStatus } from "src/composables/usePrismStatus";

export function verifyInference(
  handle: FlagHandle<{ enabled: boolean; limit: number }>,
  runtime: { status: ObservableValue<PrismStatus> },
) {
  expectTypeOf(useFlag(handle)).toEqualTypeOf<
    ComputedRef<{ enabled: boolean; limit: number }>
  >();
  expectTypeOf(useFlag(() => handle)).toEqualTypeOf<
    ComputedRef<{ enabled: boolean; limit: number }>
  >();
  expectTypeOf(useFlagDetails(handle)).toEqualTypeOf<
    ComputedRef<FlagDetails<{ enabled: boolean; limit: number }>>
  >();
  expectTypeOf(usePrismStatus(runtime)).toEqualTypeOf<
    ComputedRef<PrismStatus>
  >();
  // @ts-expect-error A handle's declaration fixes its value type.
  useFlag<string>(handle);
}
