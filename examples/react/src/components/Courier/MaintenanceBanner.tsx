import type React from "react";
import { Warning } from "@phosphor-icons/react";
import { useFlag } from "@priemskiyyy/prism-react";
import { FlagRegion } from "src/components/FlagRegion/FlagRegion";

type MaintenanceBannerProps = { markers: boolean };

export const MaintenanceBanner: React.FunctionComponent<
  MaintenanceBannerProps
> = ({ markers }) => {
  const maintenance = useFlag("maintenance");

  if (maintenance === null) {
    return null;
  }

  return (
    <div className="px-4 pt-5">
      <FlagRegion flagKeys={["maintenance"]} markers={markers}>
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <Warning aria-hidden="true" size={18} weight="fill" />
          {maintenance.message}
        </div>
      </FlagRegion>
    </div>
  );
};
