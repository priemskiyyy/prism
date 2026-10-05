import type { PrismError } from "src/PrismError";
import type { Resolution } from "src/types/Resolution";

export type FlagDetails<T> = {
  value: T;
  resolution: Resolution;
  error?: PrismError;
  variant?: string;
};
