import { expectTypeOf } from "vitest";
import type {
  FlagDetails,
  FlagHandle,
  ObservableValue,
  PrismStatus,
} from "@priemskiyyy/prism";
import { useFlag } from "src/hooks/useFlag";
import { useFlagDetails } from "src/hooks/useFlagDetails";
import { usePrismStatus } from "src/hooks/usePrismStatus";

export const useTypeContracts = (
  handle: FlagHandle<{ enabled: boolean; limit: number }>,
  runtime: { status: ObservableValue<PrismStatus> },
) => {
  expectTypeOf(useFlag(handle)).toEqualTypeOf<{
    enabled: boolean;
    limit: number;
  }>();
  expectTypeOf(useFlag(handle, (value) => value.limit)).toEqualTypeOf<number>();
  expectTypeOf(useFlagDetails(handle)).toEqualTypeOf<
    FlagDetails<{ enabled: boolean; limit: number }>
  >();
  expectTypeOf(
    useFlagDetails(handle, (details) => details.resolution),
  ).toEqualTypeOf<FlagDetails<unknown>["resolution"]>();
  expectTypeOf(
    usePrismStatus(runtime, (status) => status.refreshing),
  ).toEqualTypeOf<boolean>();
  // @ts-expect-error The handle fixes the selected value type.
  useFlag(handle, (value: string) => value.length);
  useFlag(
    handle,
    (value) => value.limit,
    // @ts-expect-error Equal snapshots are structurally shared; there is no comparator.
    () => true,
  );
};
