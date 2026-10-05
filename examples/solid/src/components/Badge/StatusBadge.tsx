import type { Component } from "solid-js";
import { usePrismStatus } from "@priemskiyyy/prism-solid";
import { formatStatus } from "examples/shared/courier/utils/formatStatus";
import { dotStyles } from "examples/shared/ui/styles/dotStyles";
import { getStatusTone } from "examples/shared/ui/utils/getStatusTone";
import { ToneBadge } from "src/components/Badge/ToneBadge";

export const StatusBadge: Component = () => {
  const status = usePrismStatus();
  const tone = () => getStatusTone(status());

  return (
    <ToneBadge tone={tone()}>
      <span aria-hidden="true" class={dotStyles({ tone: tone() })} />
      {formatStatus(status())}
    </ToneBadge>
  );
};
