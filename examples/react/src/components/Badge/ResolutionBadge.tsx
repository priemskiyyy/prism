import type React from "react";
import type { Resolution } from "@priemskiyyy/prism";
import { RESOLUTION_TONES } from "examples/shared/ui/constants/tones";
import { dotStyles } from "examples/shared/ui/styles/dotStyles";
import { Badge } from "src/components/Badge/Badge";

type ResolutionBadgeProps = { resolution: Resolution };

export const ResolutionBadge: React.FunctionComponent<ResolutionBadgeProps> = ({
  resolution,
}) => (
  <Badge tone={RESOLUTION_TONES[resolution]}>
    <span
      aria-hidden="true"
      className={dotStyles({ tone: RESOLUTION_TONES[resolution] })}
    />
    {resolution}
  </Badge>
);
