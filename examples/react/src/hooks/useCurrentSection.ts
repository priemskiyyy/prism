import { useEffect, useState } from "react";
import type { SectionId } from "src/types/SectionId";
import { SECTION_IDS } from "src/utils/constants/sections";

const isSectionId = (id: string): id is SectionId =>
  SECTION_IDS.some((sectionId) => sectionId === id);

export const useCurrentSection = () => {
  const [current, setCurrent] = useState<SectionId>("workspace");

  useEffect(() => {
    const crossing = new Set<SectionId>();

    const pick = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1;

      const next = atBottom
        ? SECTION_IDS.at(-1)
        : SECTION_IDS.find((id) => crossing.has(id));

      if (next === undefined) {
        return;
      }

      setCurrent(next);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const { id } = entry.target;

          if (!isSectionId(id)) {
            continue;
          }

          if (entry.isIntersecting) {
            crossing.add(id);

            continue;
          }

          crossing.delete(id);
        }

        pick();
      },
      { rootMargin: "-33% 0px -62% 0px" },
    );

    for (const id of SECTION_IDS) {
      const element = document.getElementById(id);

      if (element === null) {
        continue;
      }

      observer.observe(element);
    }

    window.addEventListener("scroll", pick, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", pick);
    };
  }, []);

  return current;
};
