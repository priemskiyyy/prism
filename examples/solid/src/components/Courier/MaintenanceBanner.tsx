import { Show } from "solid-js";
import type { Component } from "solid-js";
import { useFlag } from "@priemskiyyy/prism-solid";
import { ICONS } from "examples/shared/ui/constants/icons";
import { BaseIcon } from "src/components/BaseIcon/BaseIcon";
import { FlagRegion } from "src/components/FlagRegion/FlagRegion";

type MaintenanceBannerProps = { markers: boolean };

export const MaintenanceBanner: Component<MaintenanceBannerProps> = (props) => {
  const maintenance = useFlag("maintenance");

  return (
    <Show when={maintenance()}>
      {(notice) => (
        <div class="px-4 pt-5">
          <FlagRegion flagKeys={["maintenance"]} markers={props.markers}>
            <div
              role="status"
              class="flex items-center gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <BaseIcon src={ICONS.warning} size="large" />
              {notice().message}
            </div>
          </FlagRegion>
        </div>
      )}
    </Show>
  );
};
