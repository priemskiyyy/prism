import type { PrismStatus } from "src/types/PrismStatus";

export const IDLE_PRISM_STATUS: PrismStatus = Object.freeze({
  state: "idle",
  refreshing: false,
});

export const DISPOSED_PRISM_STATUS: PrismStatus = Object.freeze({
  state: "disposed",
  refreshing: false,
});
