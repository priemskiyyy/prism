import { readPreference } from "src/internal/storage";
import type { PanelPosition } from "src/types/PanelPosition";
import { DEFAULT_PANEL_SIZES } from "src/utils/constants/panel";
import { SIZE_PREFERENCE_KEYS } from "src/utils/constants/preferences";

export const readSizePreference = (position: PanelPosition) => {
  const stored = Number.parseInt(
    readPreference(SIZE_PREFERENCE_KEYS[position]) ?? "",
    10,
  );

  if (Number.isNaN(stored)) {
    return DEFAULT_PANEL_SIZES[position];
  }

  return stored;
};
