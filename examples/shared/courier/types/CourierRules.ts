import type { AssistantRollout } from "examples/shared/courier/types/AssistantRollout";
import type { ComposerRollout } from "examples/shared/courier/types/ComposerRollout";

export type CourierRules = {
  composerRollout: ComposerRollout;
  assistantRollout: AssistantRollout;
  maintenance: boolean;
  corruptChannels: boolean;
};
