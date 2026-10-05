import { expectTypeOf } from "vitest";
import type {
  FlagDetails,
  FlagHandle,
  ObservableValue,
  PrismStatus,
} from "@priemskiyyy/prism";
import type { Accessor } from "solid-js";
import { useFlag } from "src/primitives/useFlag";
import { useFlagDetails } from "src/primitives/useFlagDetails";
import { usePrismStatus } from "src/primitives/usePrismStatus";

export function verifyInference(
  handle: FlagHandle<{ enabled: boolean; limit: number }>,
  runtime: { status: ObservableValue<PrismStatus> },
) {
  expectTypeOf(useFlag(handle)).toEqualTypeOf<
    Accessor<{ enabled: boolean; limit: number }>
  >();
  expectTypeOf(useFlag(() => handle)).toEqualTypeOf<
    Accessor<{ enabled: boolean; limit: number }>
  >();
  expectTypeOf(useFlagDetails(handle)).toEqualTypeOf<
    Accessor<FlagDetails<{ enabled: boolean; limit: number }>>
  >();
  expectTypeOf(usePrismStatus(runtime)).toEqualTypeOf<Accessor<PrismStatus>>();
  // @ts-expect-error A handle's declaration fixes its value type.
  useFlag<string>(handle);
}
