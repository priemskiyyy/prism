import type { PrismError } from "src/PrismError";

export type PrismStatus = {
  state: "idle" | "loading" | "ready" | "error" | "disposed";
  refreshing: boolean;
  error?: PrismError;
};
