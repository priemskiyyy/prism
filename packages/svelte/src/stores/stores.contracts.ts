import { expectTypeOf } from "vitest";
import type {
  FlagDetails,
  FlagHandle,
  ObservableValue,
  PrismStatus,
} from "@priemskiyyy/prism";
import type { Readable } from "svelte/store";
import { flagStore } from "src/stores/flagStore";
import { flagDetailsStore } from "src/stores/flagDetailsStore";
import { prismStatusStore } from "src/stores/prismStatusStore";

export const typeContracts = (
  handle: FlagHandle<{ enabled: boolean; limit: number }>,
  runtime: { status: ObservableValue<PrismStatus> },
) => {
  expectTypeOf(flagStore(handle)).toEqualTypeOf<
    Readable<{ enabled: boolean; limit: number }>
  >();
  expectTypeOf(flagStore(handle, (value) => value.limit)).toEqualTypeOf<
    Readable<number>
  >();
  expectTypeOf(flagDetailsStore(handle)).toEqualTypeOf<
    Readable<FlagDetails<{ enabled: boolean; limit: number }>>
  >();
  expectTypeOf(
    flagDetailsStore(handle, (details) => details.resolution),
  ).toEqualTypeOf<Readable<FlagDetails<unknown>["resolution"]>>();
  expectTypeOf(prismStatusStore(runtime)).toEqualTypeOf<
    Readable<PrismStatus>
  >();
  expectTypeOf(
    prismStatusStore(runtime, (status) => status.refreshing),
  ).toEqualTypeOf<Readable<boolean>>();
  // @ts-expect-error Handles fix the selector input type.
  flagStore(handle, (value: string) => value.length);
  flagStore(
    handle,
    (value) => value.limit,
    // @ts-expect-error Equal snapshots are structurally shared; there is no comparator.
    () => true,
  );
  // @ts-expect-error Flag stores expose observation, not local mutation.
  flagStore(handle).set({ enabled: true, limit: 3 });
};
