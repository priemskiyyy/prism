import type { PrismStatus } from "@priemskiyyy/prism";
import { STATUS_LABELS } from "examples/shared/courier/constants/labels";

export const formatStatus = ({ state, refreshing }: PrismStatus) => {
  if (refreshing) {
    return `${STATUS_LABELS[state]} · refreshing`;
  }

  return STATUS_LABELS[state];
};
