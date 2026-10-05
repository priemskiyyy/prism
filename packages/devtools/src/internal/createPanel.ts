import { createElement } from "src/internal/createElement";
import { createResizeHandle } from "src/internal/createResizeHandle";
import { readSizePreference } from "src/internal/readSizePreference";
import { readPreference, writePreference } from "src/internal/storage";
import type { PanelPosition } from "src/types/PanelPosition";
import {
  POSITION_PREFERENCE_KEY,
  SIZE_PREFERENCE_KEYS,
} from "src/utils/constants/preferences";

type PanelOptions = {
  dock: HTMLButtonElement;
  children: HTMLElement[];
};

export const createPanel = ({ dock, children }: PanelOptions) => {
  let position: PanelPosition =
    readPreference(POSITION_PREFERENCE_KEY) === "RIGHT" ? "RIGHT" : "BOTTOM";

  const sizes = new Map<PanelPosition, number>([
    ["BOTTOM", readSizePreference("BOTTOM")],
    ["RIGHT", readSizePreference("RIGHT")],
  ]);

  const getSize = () => sizes.get(position) ?? readSizePreference(position);

  const resize = createResizeHandle({
    getPosition: () => position,
    getSize,
    onSizeChange: (size) => {
      sizes.set(position, size);
      writePreference(SIZE_PREFERENCE_KEYS[position], `${size}`);
      applyLayout();
    },
  });

  const panel = createElement("section", "panel", [resize, ...children]);

  const applyLayout = () => {
    const size = getSize();

    panel.dataset["position"] = position;
    resize.dataset["position"] = position;
    panel.style.setProperty("--panel-size", `${size}px`);
    resize.setAttribute("aria-valuenow", `${size}`);
    resize.setAttribute(
      "aria-orientation",
      position === "BOTTOM" ? "horizontal" : "vertical",
    );
    dock.textContent = position === "BOTTOM" ? "Dock right" : "Dock bottom";
  };

  panel.setAttribute("aria-label", "Prism devtools");
  panel.hidden = true;
  dock.addEventListener("click", () => {
    position = position === "BOTTOM" ? "RIGHT" : "BOTTOM";
    writePreference(POSITION_PREFERENCE_KEY, position);
    applyLayout();
  });
  applyLayout();

  return panel;
};
