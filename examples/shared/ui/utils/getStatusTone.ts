import type { PrismStatus } from "@priemskiyyy/prism";
import { STATUS_TONES } from "examples/shared/ui/constants/tones";
import type { Tone } from "examples/shared/ui/types/Tone";

export const getStatusTone = ({ state, refreshing }: PrismStatus): Tone => {
  if (refreshing) {
    return "warning";
  }

  return STATUS_TONES[state];
};
