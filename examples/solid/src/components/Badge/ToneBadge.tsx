import type { ParentComponent } from "solid-js";
import { badgeStyles } from "examples/shared/ui/styles/badgeStyles";
import type { Tone } from "examples/shared/ui/types/Tone";

type ToneBadgeProps = { tone: Tone };

export const ToneBadge: ParentComponent<ToneBadgeProps> = (props) => (
  <span class={badgeStyles({ tone: props.tone })}>{props.children}</span>
);
