import { For, Show } from "solid-js";
import type { ParentComponent } from "solid-js";
import type { RegisteredKey } from "@priemskiyyy/prism-solid";
import { FlagChip } from "src/components/FlagChip/FlagChip";

type FlagRegionProps = { flagKeys: RegisteredKey[]; markers: boolean };

export const FlagRegion: ParentComponent<FlagRegionProps> = (props) => (
  <div class="relative min-w-0">
    {props.children}
    <Show when={props.markers}>
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -inset-1.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700"
      />
      <div class="absolute -top-4 left-3 z-10 flex flex-wrap gap-1">
        <For each={props.flagKeys}>
          {(flagKey) => <FlagChip flagKey={flagKey} />}
        </For>
      </div>
    </Show>
  </div>
);
