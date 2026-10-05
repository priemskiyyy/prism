import type { FlagDetails, PrismStatus } from "@priemskiyyy/prism";
import type { CourierFlagKey } from "examples/shared/courier/types/CourierFlagKey";

export type TimelineEntry =
  | { kind: "STATUS"; status: PrismStatus }
  | { kind: "FLAG"; key: CourierFlagKey; details: FlagDetails<unknown> };
