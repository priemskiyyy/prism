import type { CourierRules } from "examples/shared/courier/types/CourierRules";

export const INITIAL_RULES: CourierRules = {
  composerRollout: "ADMINS",
  assistantRollout: "PAID",
  maintenance: false,
  corruptChannels: false,
};
