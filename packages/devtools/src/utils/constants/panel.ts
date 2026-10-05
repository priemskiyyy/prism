import type { PanelPosition } from "src/types/PanelPosition";

export const MIN_PANEL_SIZE = 240;

export const PANEL_EDGE_MARGIN = 24;

export const RESIZE_STEP = 24;

export const DEFAULT_PANEL_SIZES: Record<PanelPosition, number> = {
  BOTTOM: 360,
  RIGHT: 480,
};
