import type { AssistantRollout } from "examples/shared/courier/types/AssistantRollout";
import type { ComposerRollout } from "examples/shared/courier/types/ComposerRollout";

export const COMPOSER_ROLLOUTS: ComposerRollout[] = [
  "OFF",
  "ADMINS",
  "EVERYONE",
];

export const ASSISTANT_ROLLOUTS: AssistantRollout[] = [
  "OFF",
  "PAID",
  "EVERYONE",
];
