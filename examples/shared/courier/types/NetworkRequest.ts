import type { RequestOutcome } from "examples/shared/courier/types/RequestOutcome";

export type NetworkRequest = {
  id: number;
  provider: string;
  method: string;
  path: string;
  membership: string | undefined;
  status: number | undefined;
  outcome: RequestOutcome;
  duration: number;
};
