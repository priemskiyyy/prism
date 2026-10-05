import type { PrismStatus } from "@priemskiyyy/prism";

export const getStatusState = ({ state, refreshing }: PrismStatus) => {
  if (refreshing) {
    return "refreshing";
  }

  return state;
};
