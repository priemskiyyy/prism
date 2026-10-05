import type React from "react";
import clsx from "clsx";
import { useCurrentSection } from "src/hooks/useCurrentSection";
import { navLinkStyles } from "src/styles/navLinkStyles";
import { scrollToElement } from "src/utils/scrollToElement";
import { SECTION_IDS, SECTIONS } from "src/utils/constants/sections";

export const SectionNav: React.FunctionComponent = () => {
  const current = useCurrentSection();

  return (
    <nav
      aria-label="Explore Courier"
      className="flex gap-1 overflow-x-auto py-1"
    >
      {SECTION_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-current={current === id ? "location" : undefined}
          onClick={() => scrollToElement(id)}
          className={clsx(
            navLinkStyles({ current: current === id }),
            "shrink-0",
          )}
        >
          {SECTIONS[id].label}
        </button>
      ))}
    </nav>
  );
};
