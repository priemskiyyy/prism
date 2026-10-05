import type React from "react";
import type { RegisteredKey } from "@priemskiyyy/prism-react";
import type { ReactNode } from "react";
import { FlagChip } from "src/components/FlagChip/FlagChip";

type FlagRegionProps = {
  flagKeys: RegisteredKey[];
  markers: boolean;
  children: ReactNode;
};

export const FlagRegion: React.FunctionComponent<FlagRegionProps> = ({
  flagKeys,
  markers,
  children,
}) => (
  <div className="relative min-w-0">
    {children}
    {markers ? (
      <>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700"
        />
        <div className="absolute -top-4 left-3 z-10 flex flex-wrap gap-1">
          {flagKeys.map((flagKey) => (
            <FlagChip key={flagKey} flagKey={flagKey} />
          ))}
        </div>
      </>
    ) : null}
  </div>
);
