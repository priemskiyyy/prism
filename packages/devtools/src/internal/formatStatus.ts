import type { PrismStatus } from "@priemskiyyy/prism";

export const formatStatus = ({ state, refreshing }: PrismStatus) => {
  if (refreshing) {
    return `${state} · refreshing`;
  }

  return state;
};
