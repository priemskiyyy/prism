import type { AssistantRollout } from "examples/shared/courier/types/AssistantRollout";
import type { ComposerRollout } from "examples/shared/courier/types/ComposerRollout";
import type { RequestOutcome } from "examples/shared/courier/types/RequestOutcome";

export const OUTCOME_LABELS: Record<RequestOutcome, string> = {
  OK: "OK",
  FAILED: "Failed",
  ABORTED: "Aborted",
};

export const COMPOSER_ROLLOUT_LABELS: Record<ComposerRollout, string> = {
  OFF: "Off",
  ADMINS: "Admins",
  EVERYONE: "Everyone",
};

export const ASSISTANT_ROLLOUT_LABELS: Record<AssistantRollout, string> = {
  OFF: "Off",
  PAID: "Paid plans",
  EVERYONE: "Everyone",
};

export const PROVIDER_LABEL = "Provider";
