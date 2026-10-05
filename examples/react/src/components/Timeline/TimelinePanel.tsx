import type React from "react";
import {
  ArrowsClockwise,
  ClockCounterClockwise,
  Power,
} from "@phosphor-icons/react";
import { usePrismStatus } from "@priemskiyyy/prism-react";
import type { CourierRuntime } from "examples/shared/courier/types/CourierRuntime";
import { formatStatus } from "examples/shared/courier/utils/formatStatus";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
import { dotStyles } from "examples/shared/ui/styles/dotStyles";
import { getStatusTone } from "examples/shared/ui/utils/getStatusTone";
import { EmptyState } from "src/components/EmptyState/EmptyState";
import { Panel } from "src/components/Panel/Panel";
import { TimelineRow } from "src/components/Timeline/TimelineRow";
import { useEventLog } from "src/hooks/useEventLog";
import { PROVIDER_GUIDES } from "src/utils/constants/providerGuides";

type TimelinePanelProps = {
  runtime: CourierRuntime;
  onRefreshPress: () => void;
  onRestartPress: () => void;
};

export const TimelinePanel: React.FunctionComponent<TimelinePanelProps> = ({
  runtime,
  onRefreshPress,
  onRestartPress,
}) => {
  const status = usePrismStatus();
  const events = useEventLog(runtime.timeline);

  return (
    <Panel
      title="Timeline"
      icon={ClockCounterClockwise}
      shows={`What the ${PROVIDER_GUIDES[runtime.provider].name} runtime published, newest first. A read publishes every flag in one batch.`}
      aside={
        <>
          <button
            type="button"
            onClick={onRefreshPress}
            className={buttonStyles({ size: "small" })}
          >
            <ArrowsClockwise aria-hidden="true" size={14} weight="bold" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onRestartPress}
            className={buttonStyles({ size: "small" })}
          >
            <Power aria-hidden="true" size={14} weight="bold" />
            Restart runtime
          </button>
        </>
      }
    >
      <div
        role="status"
        aria-label="Runtime status"
        className="flex flex-wrap items-center gap-2 text-base"
      >
        <span
          aria-hidden="true"
          className={dotStyles({
            tone: getStatusTone(status),
            size: "regular",
          })}
        />
        <span className="font-medium">{formatStatus(status)}</span>
        {status.error === undefined ? null : (
          <span className="text-rose-600 dark:text-rose-400">
            {status.error.code} · {status.error.message}
          </span>
        )}
      </div>
      {events.length === 0 ? (
        <EmptyState
          icon={ClockCounterClockwise}
          title="Nothing published yet"
          description="Status changes and flag updates appear here as the runtime publishes them."
        />
      ) : (
        <ol
          aria-label="Timeline events"
          className="flex max-h-[28rem] flex-col divide-y divide-zinc-200/70 overflow-y-auto text-sm dark:divide-zinc-800"
        >
          {events.map((event) => (
            <TimelineRow key={event.id} event={event} />
          ))}
        </ol>
      )}
    </Panel>
  );
};
