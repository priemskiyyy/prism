import type React from "react";
import type { TimelineEvent } from "examples/shared/courier/types/TimelineEvent";
import { formatStatus } from "examples/shared/courier/utils/formatStatus";
import { getStatusTone } from "examples/shared/ui/utils/getStatusTone";
import { Badge } from "src/components/Badge/Badge";
import { ResolutionBadge } from "src/components/Badge/ResolutionBadge";
import { formatClockTime } from "src/formatting/formatClockTime";
import { formatJson } from "src/formatting/formatJson";

type TimelineRowProps = { event: TimelineEvent };

const TimelineDescription: React.FunctionComponent<TimelineRowProps> = ({
  event,
}) => {
  if (event.kind === "STATUS") {
    return (
      <span className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="font-medium">Status</span>
        <Badge tone={getStatusTone(event.status)}>
          {formatStatus(event.status)}
        </Badge>
        {event.status.error === undefined ? null : (
          <span className="text-rose-600 dark:text-rose-400">
            {event.status.error.code}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
      <code className="font-semibold">{event.key}</code>
      <ResolutionBadge resolution={event.details.resolution} />
      <code className="min-w-0 truncate text-zinc-600 dark:text-zinc-400">
        {formatJson(event.details.value)}
      </code>
    </span>
  );
};

export const TimelineRow: React.FunctionComponent<TimelineRowProps> = ({
  event,
}) => (
  <li className="grid grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-3 py-2">
    <time
      dateTime={new Date(event.at).toISOString()}
      className="font-mono text-zinc-500 tabular-nums"
    >
      {formatClockTime(event.at)}
    </time>
    <TimelineDescription event={event} />
  </li>
);
