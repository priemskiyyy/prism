import type React from "react";
import type { ReactNode } from "react";
import type { SectionId } from "src/types/SectionId";
import { SECTIONS } from "src/utils/constants/sections";

type SectionProps = { id: SectionId; hint: string; children: ReactNode };

export const Section: React.FunctionComponent<SectionProps> = ({
  id,
  hint,
  children,
}) => {
  const { number, title } = SECTIONS[id];

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-28 flex-col gap-3"
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 font-mono text-base font-semibold text-white tabular-nums dark:bg-indigo-400 dark:text-zinc-950"
        >
          {number}
        </span>
        <h2
          id={`${id}-title`}
          className="text-xl font-semibold tracking-tight sm:text-2xl"
        >
          {title}
        </h2>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">
            Try:
          </span>{" "}
          {hint}
        </p>
      </header>
      {children}
    </section>
  );
};
