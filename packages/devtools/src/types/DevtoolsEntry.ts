import type { FlagDetails, PrismStatus } from "@priemskiyyy/prism";

export type DevtoolsEntry =
  | { kind: "STATUS"; status: PrismStatus }
  | { kind: "FLAG"; key: string; details: FlagDetails<unknown> };
