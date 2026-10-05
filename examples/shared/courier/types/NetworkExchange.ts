import type { CourierContext } from "examples/shared/courier/types/CourierContext";

export type NetworkExchange = {
  provider: string;
  method: string;
  path: string;
  context: CourierContext | undefined;
  signal: AbortSignal | null | undefined;
};
