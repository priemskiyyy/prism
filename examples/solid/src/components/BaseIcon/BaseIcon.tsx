import type { Component } from "solid-js";
import { iconStyles } from "examples/shared/ui/styles/iconStyles";
import type { IconSize } from "examples/shared/ui/types/IconSize";
import { getIconMask } from "examples/shared/ui/utils/getIconMask";

type BaseIconProps = { src: string; size: IconSize };

export const BaseIcon: Component<BaseIconProps> = (props) => (
  <span
    aria-hidden="true"
    class={iconStyles({ size: props.size })}
    style={{ "mask-image": getIconMask(props.src) }}
  />
);
