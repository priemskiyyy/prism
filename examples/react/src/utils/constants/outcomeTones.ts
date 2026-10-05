import type { RequestOutcome } from "examples/shared/courier/types/RequestOutcome";
import type { Tone } from "examples/shared/ui/types/Tone";

export const OUTCOME_TONES: Record<RequestOutcome, Tone> = {
  OK: "positive",
  FAILED: "danger",
  ABORTED: "warning",
};
