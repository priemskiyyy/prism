import type { LDIdentifyResult } from "@launchdarkly/react-native-client-sdk";
import type { PrismErrorCode } from "@priemskiyyy/prism";

export const IDENTIFY_ERROR_CODES = {
  error: "EVALUATION_FAILED",
  timeout: "TIMEOUT",
  shed: "EVALUATION_FAILED",
} satisfies Record<
  Exclude<LDIdentifyResult["status"], "completed">,
  PrismErrorCode
>;
