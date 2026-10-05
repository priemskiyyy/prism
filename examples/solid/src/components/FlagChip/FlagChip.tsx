import { Show } from "solid-js";
import type { Component } from "solid-js";
import { useFlagDetails } from "@priemskiyyy/prism-solid";
import type { RegisteredKey } from "@priemskiyyy/prism-solid";
import { ICONS } from "examples/shared/ui/constants/icons";
import { RESOLUTION_TONES } from "examples/shared/ui/constants/tones";
import { dotStyles } from "examples/shared/ui/styles/dotStyles";
import { FLAG_CHIP_CLASS_NAME } from "examples/shared/ui/styles/flagChipStyles";
import { BaseIcon } from "src/components/BaseIcon/BaseIcon";

type FlagChipProps = { flagKey: RegisteredKey };

export const FlagChip: Component<FlagChipProps> = (props) => {
  const details = useFlagDetails(() => props.flagKey);

  const revision = () =>
    `${details().resolution}:${JSON.stringify(details().value)}`;

  return (
    <Show when={revision()} keyed>
      <span
        title={`${props.flagKey} is ${details().resolution}`}
        class={FLAG_CHIP_CLASS_NAME}
      >
        <BaseIcon src={ICONS.flag} size="small" />
        {props.flagKey}
        <span
          aria-hidden="true"
          class={dotStyles({ tone: RESOLUTION_TONES[details().resolution] })}
        />
      </span>
    </Show>
  );
};
