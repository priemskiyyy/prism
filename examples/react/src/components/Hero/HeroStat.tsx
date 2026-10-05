import type React from "react";

type HeroStatProps = { label: string; value: number };

export const HeroStat: React.FunctionComponent<HeroStatProps> = ({
  label,
  value,
}) => (
  <div className="flex flex-col rounded-xl bg-white/70 px-4 py-3 dark:bg-zinc-900/60">
    <dt className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
      {label}
    </dt>
    <dd className="text-3xl font-semibold tabular-nums">{value}</dd>
  </div>
);
