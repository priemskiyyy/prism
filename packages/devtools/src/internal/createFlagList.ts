import { createElement } from "src/internal/createElement";
import { createFlagRow } from "src/internal/createFlagRow";
import type { DevtoolsFlag } from "src/types/DevtoolsFlag";

type FlagListOptions = {
  flags: DevtoolsFlag[];
  override: (flag: DevtoolsFlag, value: unknown) => void;
  release: (flag: DevtoolsFlag) => void;
};

export const createFlagList = ({
  flags,
  override,
  release,
}: FlagListOptions) => {
  const search = createElement("input", "", []);

  const rows = new Map(
    flags.map((flag) => [flag, createFlagRow({ flag, override, release })]),
  );

  const list = createElement(
    "ul",
    "list",
    [...rows.values()].map((row) => row.element),
  );

  const element = createElement("div", "view", [
    createElement("div", "toolbar", [search]),
    list,
  ]);

  const stale = new Set(flags);

  search.type = "search";
  search.placeholder = "Filter flags";
  search.setAttribute("aria-label", "Filter flags");
  list.setAttribute("aria-label", "Flags");

  search.addEventListener("input", () => {
    for (const row of rows.values()) {
      row.filter(search.value);
    }
  });

  return {
    element,
    markStale: (flag: DevtoolsFlag) => {
      stale.add(flag);
    },
    render: () => {
      for (const flag of stale) {
        rows.get(flag)?.update(flag.handle.details.get());
      }

      stale.clear();
    },
  };
};
