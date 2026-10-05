import type { PanelPosition } from "src/types/PanelPosition";

export const OPEN_PREFERENCE_KEY = "prism-devtools:open";

export const TAB_PREFERENCE_KEY = "prism-devtools:tab";

export const POSITION_PREFERENCE_KEY = "prism-devtools:position";

export const SIZE_PREFERENCE_KEYS: Record<PanelPosition, string> = {
  BOTTOM: "prism-devtools:size:bottom",
  RIGHT: "prism-devtools:size:right",
};
