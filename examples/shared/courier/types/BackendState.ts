import type { CourierRules } from "examples/shared/courier/types/CourierRules";
import type { NetworkLatency } from "examples/shared/courier/types/NetworkLatency";

export type BackendState = {
  latency: NetworkLatency;
  offline: boolean;
  failNext: boolean;
  live: boolean;
  rules: CourierRules;
};
