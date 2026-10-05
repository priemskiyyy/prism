import { createElement } from "src/internal/createElement";
import type { PanelPosition } from "src/types/PanelPosition";
import {
  MIN_PANEL_SIZE,
  PANEL_EDGE_MARGIN,
  RESIZE_STEP,
} from "src/utils/constants/panel";

type ResizeHandleOptions = {
  getPosition: () => PanelPosition;
  getSize: () => number;
  onSizeChange: (size: number) => void;
};

export const createResizeHandle = ({
  getPosition,
  getSize,
  onSizeChange,
}: ResizeHandleOptions) => {
  const handle = createElement("div", "resize", []);

  const clamp = (size: number) => {
    const available =
      getPosition() === "BOTTOM" ? window.innerHeight : window.innerWidth;

    return Math.round(
      Math.min(Math.max(size, MIN_PANEL_SIZE), available - PANEL_EDGE_MARGIN),
    );
  };

  const getDistance = (start: PointerEvent, move: PointerEvent) => {
    if (getPosition() === "BOTTOM") {
      return start.clientY - move.clientY;
    }

    return start.clientX - move.clientX;
  };

  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-label", "Resize devtools");
  handle.setAttribute("aria-valuemin", `${MIN_PANEL_SIZE}`);
  handle.tabIndex = 0;

  handle.addEventListener("pointerdown", (start) => {
    const startSize = getSize();

    const handlePointerMove = (move: PointerEvent) => {
      onSizeChange(clamp(startSize + getDistance(start, move)));
    };

    const handlePointerUp = () => {
      handle.removeEventListener("pointermove", handlePointerMove);
      handle.removeEventListener("pointerup", handlePointerUp);
    };

    handle.setPointerCapture(start.pointerId);
    handle.addEventListener("pointermove", handlePointerMove);
    handle.addEventListener("pointerup", handlePointerUp);
  });

  handle.addEventListener("keydown", (event) => {
    const grow = getPosition() === "BOTTOM" ? "ArrowUp" : "ArrowLeft";
    const shrink = getPosition() === "BOTTOM" ? "ArrowDown" : "ArrowRight";

    if (event.key === grow) {
      event.preventDefault();
      onSizeChange(clamp(getSize() + RESIZE_STEP));

      return;
    }

    if (event.key !== shrink) {
      return;
    }

    event.preventDefault();
    onSizeChange(clamp(getSize() - RESIZE_STEP));
  });

  return handle;
};
