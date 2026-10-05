import type { FlagDetails } from "@priemskiyyy/prism";

export type FlagRow = {
  element: HTMLLIElement;
  update: (details: FlagDetails<unknown>) => void;
  filter: (query: string) => void;
};
