import type React from "react";
import { usePrismStatus } from "@priemskiyyy/prism-react";
import { formatStatus } from "examples/shared/courier/utils/formatStatus";
import { dotStyles } from "examples/shared/ui/styles/dotStyles";
import { getStatusTone } from "examples/shared/ui/utils/getStatusTone";
import { Badge } from "src/components/Badge/Badge";

export const StatusBadge: React.FunctionComponent = () => {
  const status = usePrismStatus();
  const tone = getStatusTone(status);

  return (
    <Badge tone={tone}>
      <span aria-hidden="true" className={dotStyles({ tone })} />
      {formatStatus(status)}
    </Badge>
  );
};
